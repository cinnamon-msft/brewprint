using Brewprint.Api;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/recipes", () => RecipeCatalog.All);
app.MapGet("/api/recipes/{id}/customize", (string id, string? shots, string? milk) =>
{
    var recipe = RecipeCatalog.Find(id);
    if (recipe is null) return Results.Problem(statusCode: 404, title: "Recipe not found");
    if (!double.TryParse(shots, CultureInfo.InvariantCulture, out var count) ||
        !double.IsFinite(count) || count is < 1 or > 4 || count != Math.Truncate(count))
        return Results.Problem(statusCode: 400, title: "Invalid shots", detail: "Choose 1 through 4 whole espresso shots.");
    try { return Results.Ok(RecipeCustomizer.Customize(recipe, (int)count, milk)); }
    catch (ArgumentException exception)
    {
        return Results.Problem(statusCode: 400, title: "Cannot customize this recipe", detail: exception.Message);
    }
});
app.MapGet("/api/recipes/{id}", (string id) =>
    RecipeCatalog.Find(id) is { } recipe
        ? Results.Ok(recipe)
        : Results.Problem(statusCode: 404, title: "Recipe not found",
            detail: $"No predefined drink has the ID '{id}'."));
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.Map("/api/{**path}", () => Results.Problem(statusCode: 404, title: "API endpoint not found"));
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program;
