using System.Net;
using System.Net.Http.Json;
using Brewprint.Api;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Brewprint.Api.Tests;

public sealed class CustomizationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;
    public CustomizationTests(WebApplicationFactory<Program> factory) => client = factory.CreateClient();

    [Theory]
    [InlineData("latte", 2, 240, 150)]
    [InlineData("cappuccino", 3, 180, 30)]
    [InlineData("flat-white", 4, 165, 30)]
    public async Task MilkRecipesPreserveTotalAndFoam(string id, int shots, int total, int milkMl)
    {
        var recipe = await client.GetFromJsonAsync<Recipe>($"/api/recipes/{id}/customize?shots={shots}&milk=Oat");
        Assert.NotNull(recipe);
        Assert.Equal(total, recipe.ServingMl);
        Assert.Equal(total, recipe.Layers.Sum(layer => layer.AmountMl));
        Assert.Equal(milkMl, recipe.Layers.Single(layer => layer.Ingredient == "steamed-milk").AmountMl);
        Assert.Equal("Oat milk foam", recipe.Layers.Single(layer => layer.Ingredient == "milk-foam").Label);
        Assert.Equal(RecipeCatalog.Find(id)!.Layers.Last().AmountMl, recipe.Layers.Last().AmountMl);
        Assert.All(RecipeCatalog.Find(id)!.Layers, layer => Assert.Null(layer.Label));
    }

    [Fact]
    public void EspressoExceptionAndAmericanoAdjustment()
    {
        var espresso = RecipeCustomizer.Customize(RecipeCatalog.Find("espresso")!, 4, null);
        Assert.Equal(120, espresso.ServingMl);
        Assert.Contains("exception", espresso.Description);
        var americano = RecipeCustomizer.Customize(RecipeCatalog.Find("americano")!, 4, null);
        Assert.Equal(180, americano.ServingMl);
        Assert.Equal(60, americano.Layers.Last().AmountMl);
    }

    [Theory]
    [InlineData("latte", "0", "Whole")]
    [InlineData("latte", "1.5", "Oat")]
    [InlineData("latte", "5", "Soy")]
    [InlineData("latte", "NaN", "Oat")]
    [InlineData("latte", "Infinity", "Oat")]
    [InlineData("latte", "bad", "Oat")]
    [InlineData("latte", "2", "Almond")]
    [InlineData("espresso", "1", "Oat")]
    [InlineData("americano", "1", "Soy")]
    [InlineData("brewed-coffee", "1", "Whole")]
    [InlineData("cappuccino", "4", "Oat")]
    public async Task InvalidOrImpossibleCustomizationRejects(string id, string shots, string milk) =>
        Assert.Equal(HttpStatusCode.BadRequest,
            (await client.GetAsync($"/api/recipes/{id}/customize?shots={shots}&milk={milk}")).StatusCode);

    [Fact]
    public async Task UnknownDrinkReturns404() =>
        Assert.Equal(HttpStatusCode.NotFound,
            (await client.GetAsync("/api/recipes/missing/customize?shots=1")).StatusCode);
}
