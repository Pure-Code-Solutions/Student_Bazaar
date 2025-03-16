export const renderCart = async (req, res) => {
    let cart = [ {
        name: "Book1",
        price: "$0.00"
    }, 
    {
        name: "Book12",
        price: "$0.00"
    }
    ];
    res.render("cart", {cart: cart});
}