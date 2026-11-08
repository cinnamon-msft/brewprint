[CmdletBinding()]
param(
    [string] $Repo = 'cinnamon-msft/brewprint',
    [switch] $DryRun
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$seeds = Get-Content (Join-Path $root 'docs\issue-seeds.json') -Raw | ConvertFrom-Json

function Invoke-Gh([string[]] $Arguments) {
    $output = & gh @Arguments
    if ($LASTEXITCODE -ne 0) { throw "gh failed: $($Arguments -join ' ')" }
    return $output
}

# Include closed issues too: rehearsal must never create duplicate replacements.
$pages = Invoke-Gh @('api', '--paginate', '--slurp', "repos/$Repo/issues?state=all&per_page=100") |
    Out-String | ConvertFrom-Json
$existing = @($pages | ForEach-Object { $_ } | Where-Object { -not $_.pull_request })
$labels = @{
    'demo-headline' = '742c39'; 'backlog' = 'ad8040'; 'surface-cli' = '38251f'
    'surface-vs' = '855237'; 'surface-vscode' = '69534a'; 'surface-cloud' = '396c70'
    'enhancement' = '4c7246'; 'testing' = '596b99'
}
if (-not $DryRun) {
    foreach ($name in $labels.Keys) {
        Invoke-Gh @('label', 'create', $name, '--repo', $Repo, '--color', $labels[$name],
            '--description', "Brewprint $name work", '--force') | Out-Null
    }
}
$results = @()
foreach ($seed in $seeds) {
    $marker = "<!-- brewprint-seed:$($seed.key) -->"
    $found = @($existing | Where-Object { $_.body -like "*$marker*" -or $_.title -eq $seed.title })
    if ($found.Count -gt 1) { throw "Multiple issues match $($seed.key); resolve manually." }
    if ($found.Count -eq 1) {
        $results += [pscustomobject]@{ key = $seed.key; url = $found[0].html_url; state = $found[0].state; action = 'existing' }
        continue
    }
    $dependencies = if ($seed.dependsOn) {
        ($seed.dependsOn | ForEach-Object {
            $dependencyKey = $_
            $dependency = $results | Where-Object key -EQ $dependencyKey
            if (-not $dependency) { throw "Seed dependency $dependencyKey must appear first." }
            $dependency.url
        }) -join ', '
    } else { 'None. Implement independently from demo-start.' }
    $body = "$marker`n`n$($seed.body)`n`n## Dependencies`n$dependencies`n`n## Validation`n$($seed.validation)"
    if ($DryRun) {
        $results += [pscustomobject]@{ key = $seed.key; url = "(dry run: $($seed.title))"; state = 'not-created'; action = 'would-create' }
        continue
    }
    $temporary = [IO.Path]::GetTempFileName()
    try {
        [IO.File]::WriteAllText($temporary, $body)
        $url = Invoke-Gh @('issue', 'create', '--repo', $Repo, '--title', $seed.title,
            '--body-file', $temporary, '--label', ($seed.labels -join ',')) | Out-String
        $results += [pscustomobject]@{ key = $seed.key; url = $url.Trim(); state = 'open'; action = 'created' }
    }
    finally { Remove-Item -LiteralPath $temporary }
}
$results | ConvertTo-Json
