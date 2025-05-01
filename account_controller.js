
export const renderOrders = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "orders" });
};

export const renderSelling = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "selling" });
};

export const renderAccount = (req, res) => {
  console.log("🎯 HIT renderAccount route");

  const user = req.user || req.session.user;

  if (!user) {
    console.log("🛑 No session found, redirecting...");
    return res.redirect("/signin");
  }

  res.set("Cache-Control", "no-store");

  console.log("✅ Rendering with:", {
    fullName: `${user.first_name} ${user.last_name}`,
    userEmail: user.email
  });

  res.render("user-account-dashboard", {
    activeSection: "dashboard",
    fullName: `${user.first_name} ${user.last_name}`,
    userEmail: user.email
  });
};
