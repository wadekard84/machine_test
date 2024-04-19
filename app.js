const express = require('express')
const app = express()
const mysql = require('mysql')
const port = 3000


const db = mysql.createConnection({
    host: 'nodejs-technical-test.cm30rlobuoic.ap-southeast-1.rds.amazonaws.com',
    user: 'admin',
    password: 'NoTeDeSt^C10.6?SxwY882}',
    database: 'conqtvms_dev'
})

db.connect((err) => {
    if (err) throw err
    console.log('connection success')
})

app.get("/allProducts", (req, res) => {
    let { currentPage, pageSize, orderBy, orderDir, searchBy, searchFields } = req.query

    currentPage = currentPage || 1
    pageSize = pageSize || 10
    orderBy = orderBy || 'createdAt'
    orderDir = orderDir || 'desc'
    searchBy = searchBy || ''
    searchFields = searchFields && searchFields.length > 0 ? JSON.parse(searchFields) : []

    let sql = `SELECT * FROM ProductV2 `
    let whereCondition = []

    searchFields.forEach(field=>{
        whereCondition.push(`${field} LIKE '%${searchBy}%' `)
    })
    if (whereCondition.length) {
        sql += 'WHERE' + whereCondition.join('OR')
    }
    sql+= `ORDER BY ${orderBy} ${orderDir} `
    let offset = (currentPage-1) * pageSize
    sql+= `LIMIT ${offset} , ${pageSize}` 
    let countSql = `SELECT COUNT(*) as totalCount FROM ProductV2`
    if (whereCondition.length) {
        countSql += 'WHERE' + whereCondition.join('OR')
    }
    db.query(countSql, (err, countResult) => {
        if (err) {
            res.status(500).json({err:err.message})
            return 
        }
         const totalCount = countResult[0].totalCount
         const totalPages = Math.ceil(totalCount/pageSize)
        db.query(sql, (err, result) => {
            if (err) {
                res.status(500).json({err:err.message})
            }
        else{
            res.json({
                currentPage,
                pageSize,
                totalPages,
                totalCount,
                data:result
            })
        }
        })
    })
})

app.listen(port, () => {
    console.log(`app is running on port: ${port}`);
})


