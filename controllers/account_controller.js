export const renderAccount = async (req, res) => {
    res.render("user-account-dashboard");
}


export const renderOrders = async (req, res) => {
    res.render("user-account-orders");
}

export const renderSelling = async (req, res) => {
    res.render("user-account-selling");
}