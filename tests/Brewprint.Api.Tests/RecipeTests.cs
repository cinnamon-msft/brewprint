using System.Net;
using System.Net.Http.Json;
using Brewprint.Api;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Brewprint.Api.Tests;

public sealed class RecipeTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;
    public RecipeTests(WebApplicationFactory<Program> factory) => client = factory.CreateClient();

    [Theory]
    [InlineData("espresso", 30)]
    [InlineData("americano", 180)]
    [InlineData("latte", 240)]
    [InlineData("cappuccino", 180)]
    [InlineData("flat-white", 165)]
    [InlineData("brewed-coffee", 240)]
    public async Task RecipesHaveStableIdsAndConservedTotals(string id, int expected)
    {
        var recipe = await client.GetFromJsonAsync<Recipe>($"/api/recipes/{id}");
        Assert.NotNull(recipe);
        Assert.Equal(id, recipe.Id);
        Assert.Equal(expected, recipe.ServingMl);
        Assert.Equal(expected, recipe.Layers.Sum(layer => layer.AmountMl));
        Assert.All(recipe.Layers, layer =>
        {
            Assert.InRange(layer.AmountMl, 1, 360);
            Assert.Contains(layer.Ingredient, new[] { "espresso", "brewed-coffee", "water", "steamed-milk", "milk-foam" });
        });
    }

    [Fact]
    public async Task GalleryHasExactlySixDistinctRecipes()
    {
        var recipes = await client.GetFromJsonAsync<Recipe[]>("/api/recipes");
        Assert.NotNull(recipes);
        Assert.Equal(6, recipes.Length);
        Assert.Equal(6, recipes.Select(recipe => recipe.Id).Distinct().Count());
    }

    [Theory]
    [InlineData("/api/recipes/not-a-drink")]
    [InlineData("/api/missing")]
    public async Task UnknownApiRequestsReturnProblemNotHtml(string url)
    {
        var response = await client.GetAsync(url);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
