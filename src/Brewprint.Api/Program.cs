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
app.MapGet("/api/recipes/{id}/scale", (string id, string? targetMl) =>
{
    var recipe = RecipeCatalog.Find(id);
    if (recipe is null) return Results.Problem(statusCode: 404, title: "Recipe not found");
    if (!double.TryParse(targetMl, CultureInfo.InvariantCulture, out var target) ||
        !double.IsFinite(target) || target is < 60 or > 480 || target != Math.Truncate(target))
        return Results.Problem(statusCode: 400, title: "Invalid cup size",
            detail: "Choose a whole-mL cup size from 60 through 480 mL.");
    return Results.Ok(RecipeScaler.Scale(recipe, (int)target));
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
