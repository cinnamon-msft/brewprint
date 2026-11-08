# Preparation evidence

The starter has six recipes, a working fixed-capacity manual builder and no
headline feature implementations. Local .NET 10.0.403 / Node 26.13.0 validation
passed 9 API tests, 24 frontend tests and 8 Chromium scenarios against the
published single-origin app. Coverage includes actual mouse drag/drop, real
touch taps, keyboard skip/navigation, capacity/rejection, fill geometry,
API errors/retry, recipe loading and responsive/reduced-motion behavior.
The seed script ran twice: 10 existing issues each time, no creations.
Final CI and clean-clone results will be recorded after publication.

## Headline rehearsal status

Recovery branches are not yet populated at the baseline commit. They will be
created independently from demo-start and documented here after validation.
Do not treat branch names in the runbook as proof of completed rehearsals.

## Host limitations

Visual Studio is not installed (vswhere returned an empty list). Supported
net10.0 requires Visual Studio 2026/18.0+; verify the presenter's installation.
The repository REST assignee list contains only the owner. Copilot cloud
assignment has not been proven through the actual GitHub UI, and no cloud task
or PR was launched. A local rehearsal is not a cloud execution result.
