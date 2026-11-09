namespace Brewprint.Api;

public static class RecipeScaler
{
    public static Recipe Scale(Recipe recipe, int targetMl)
    {
        if (targetMl is < 60 or > 480) throw new ArgumentOutOfRangeException(nameof(targetMl));
        var exact = recipe.Layers.Select(layer => (decimal)layer.AmountMl * targetMl / recipe.ServingMl).ToArray();
        var amounts = exact.Select(value => (int)decimal.Floor(value)).ToArray();
        var remaining = targetMl - amounts.Sum();
        var order = Enumerable.Range(0, amounts.Length)
            .OrderByDescending(index => exact[index] - amounts[index]).ThenBy(index => index);
        foreach (var index in order.Take(remaining)) amounts[index]++;
        var layers = recipe.Layers.Select((layer, index) => layer with { AmountMl = amounts[index] }).ToArray();
        return recipe with { ServingMl = targetMl, Layers = Array.AsReadOnly(layers) };
    }
}
