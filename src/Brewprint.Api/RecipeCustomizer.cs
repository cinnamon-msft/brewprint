namespace Brewprint.Api;

public static class RecipeCustomizer
{
    public static Recipe Customize(Recipe recipe, int shots, string? milk)
    {
        if (shots is < 1 or > 4) throw new ArgumentException("Choose 1 through 4 whole espresso shots.");
        var originalEspresso = recipe.Layers.SingleOrDefault(layer => layer.Ingredient == "espresso");
        if (originalEspresso is null) throw new ArgumentException("Brewed coffee is not eligible for espresso shots.");
        var hasMilk = recipe.Layers.Any(layer => layer.Ingredient is "steamed-milk" or "milk-foam");
        if (milk is not null && !hasMilk) throw new ArgumentException("Milk choice applies only to milk recipes.");
        if (milk is not null && milk is not ("Whole" or "Oat" or "Soy"))
            throw new ArgumentException("Milk choice must be Whole, Oat or Soy.");
        var espressoMl = shots * 30;
        var espressoOnly = recipe.Layers.Count == 1;
        var adjusted = recipe.Layers.Select(layer =>
        {
            if (layer.Ingredient == "espresso") return layer with { AmountMl = espressoMl };
            if (layer.Ingredient is "water" or "steamed-milk")
            {
                var amount = layer.AmountMl + originalEspresso.AmountMl - espressoMl;
                if (amount < 1) throw new ArgumentException("Insufficient serving volume: at least 1mL of water or steamed milk must remain.");
                return layer with { AmountMl = amount,
                    Label = layer.Ingredient == "steamed-milk" ? $"{milk ?? "Whole"} steamed milk" : null };
            }
            return layer with { Label = layer.Ingredient == "milk-foam" ? $"{milk ?? "Whole"} milk foam" : null };
        }).ToArray();
        return recipe with
        {
            ServingMl = espressoOnly ? espressoMl : recipe.ServingMl,
            Description = recipe.Description + (espressoOnly ? " Espresso-only exception: serving volume changes with shots." : ""),
            Layers = Array.AsReadOnly(adjusted)
        };
    }
}
