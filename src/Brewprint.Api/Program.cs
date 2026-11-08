using Brewprint.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/recipes", () => RecipeCatalog.All);
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
