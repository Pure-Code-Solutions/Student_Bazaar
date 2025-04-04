export const renderAccount = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "dashboard" });
};

export const renderOrders = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "orders" });
};

export const renderSelling = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "selling" });
};