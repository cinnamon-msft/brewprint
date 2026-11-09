namespace Brewprint.Api;

public sealed record IngredientLayer(string Ingredient, int AmountMl, string? Label = null);
public sealed record Recipe(string Id, string Name, string Description, int ServingMl,
    IReadOnlyList<IngredientLayer> Layers);

public static class RecipeCatalog
{
    public static IReadOnlyList<Recipe> All { get; } = Array.AsReadOnly(new[]
    {
        Drink("espresso", "Espresso", "A small, concentrated coffee extracted under pressure. The foundation of many bar drinks.",
            Layer("espresso", 30)),
        Drink("americano", "Americano", "Espresso lengthened with hot water. A lighter-bodied way to enjoy an espresso base.",
            Layer("espresso", 30), Layer("water", 150)),
        Drink("latte", "Latte", "Espresso with a generous layer of steamed milk and a little foam. Smooth and milk-forward.",
            Layer("espresso", 30), Layer("steamed-milk", 180), Layer("milk-foam", 30)),
        Drink("cappuccino", "Cappuccino", "An illustrative equal-parts balance of espresso, steamed milk and airy foam.",
            Layer("espresso", 60), Layer("steamed-milk", 60), Layer("milk-foam", 60)),
        Drink("flat-white", "Flat white", "A double espresso with silky steamed milk and a thin illustrative microfoam layer.",
            Layer("espresso", 60), Layer("steamed-milk", 90), Layer("milk-foam", 15)),
        Drink("brewed-coffee", "Brewed coffee", "Coffee brewed with water rather than an espresso extraction. Served here without additions.",
            Layer("brewed-coffee", 240))
    });

    public static Recipe? Find(string id) => All.FirstOrDefault(recipe => recipe.Id == id);

    private static IngredientLayer Layer(string ingredient, int amountMl) => new(ingredient, amountMl);
    private static Recipe Drink(string id, string name, string description, params IngredientLayer[] layers) =>
        new(id, name, description, layers.Sum(layer => layer.AmountMl), Array.AsReadOnly(layers));
}
