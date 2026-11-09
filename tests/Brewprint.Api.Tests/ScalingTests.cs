using System.Net;
using System.Net.Http.Json;
using Brewprint.Api;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Brewprint.Api.Tests;

public sealed class ScalingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;
    public ScalingTests(WebApplicationFactory<Program> factory) => client = factory.CreateClient();

    [Theory]
    [InlineData("espresso")]
    [InlineData("americano")]
    [InlineData("latte")]
    [InlineData("cappuccino")]
    [InlineData("flat-white")]
    [InlineData("brewed-coffee")]
    public async Task ScalesEachRecipeWithoutChangingBase(string id)
    {
        var recipe = await client.GetFromJsonAsync<Recipe>($"/api/recipes/{id}/scale?targetMl=237");
        Assert.NotNull(recipe);
        Assert.Equal(237, recipe.ServingMl);
        Assert.Equal(237, recipe.Layers.Sum(layer => layer.AmountMl));
        Assert.Equal(RecipeCatalog.Find(id)!.ServingMl,
            (await client.GetFromJsonAsync<Recipe>($"/api/recipes/{id}"))!.ServingMl);
    }

    [Theory]
    [InlineData("59")]
    [InlineData("481")]
    [InlineData("60.5")]
    [InlineData("NaN")]
    [InlineData("Infinity")]
    [InlineData("nope")]
    [InlineData("")]
    [InlineData("1e999")]
    public async Task RejectsInvalidSizes(string value) =>
        Assert.Equal(HttpStatusCode.BadRequest,
            (await client.GetAsync($"/api/recipes/latte/scale?targetMl={value}")).StatusCode);

    [Theory]
    [InlineData(60)]
    [InlineData(480)]
    [InlineData(137)]
    public void BoundsAndAwkwardSizesConserveTotal(int target)
    {
        foreach (var recipe in RecipeCatalog.All)
        {
            var scaled = RecipeScaler.Scale(recipe, target);
            Assert.Equal(target, scaled.Layers.Sum(layer => layer.AmountMl));
            Assert.All(scaled.Layers, layer => Assert.True(layer.AmountMl >= 0));
        }
    }

    [Fact]
    public void TiesFollowAssemblyOrderAndRepeatExactly()
    {
        var recipe = RecipeCatalog.Find("cappuccino")!;
        var first = RecipeScaler.Scale(recipe, 61);
        Assert.Equal(new[] { 21, 20, 20 }, first.Layers.Select(layer => layer.AmountMl));
        Assert.Equal(first.Layers, RecipeScaler.Scale(recipe, 61).Layers);
        Assert.Throws<ArgumentOutOfRangeException>(() => RecipeScaler.Scale(recipe, 59));
    }
}
