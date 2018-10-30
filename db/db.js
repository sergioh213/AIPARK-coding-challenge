const spicedPg = require("spiced-pg")
let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL)
} else {
    db = spicedPg('postgres:sergioherrero:password@localhost:5432/food-market');
}

exports.newUser = function(user_name, email, hashed_password) {
    const q = `
        INSERT INTO users (user_name, email, hashed_password)
        VALUES ($1, $2, $3)
        RETURNING *;
        `
    const params = [user_name, email, hashed_password]
    return db.query(q, params).then(results => {
        return results.rows[0]
    })
}
