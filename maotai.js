const axios = require('axios')
const cheerio = require('cheerio');
const fs = require("fs");
var xlsx = require('node-xlsx');

class Maotai {
  constructor(url) {
    this.url = url;
  }
  async getData() {
    return await axios.get(this.url).then((res) => {
      const $ = cheerio.load(res.data);
      const table = $(".table_bg001").eq(0).find('tr');
      let flag = 0
      // 找到表格行'净利润(扣除非经常性损益后)(万元)'
      table.map((index, element) => {
        if ($(element).text().trim() === '净利润(扣除非经常性损益后)(万元)') {
          flag = index
        }
      })
      // 表格 日期 与 利润 对应保存
      const trs = $(".scr_table").find('tr')
      let data = [{
        name: 'sheet1', data: []
      }]
      trs.map((index, el) => {
        if (index === 0 || index === flag) {
          let tableData = []
          $(el).find('td,th').map((j, item) => {
            tableData.push($(item).text())
          })
          data[0].data.push(tableData)
        }
      });
      let buffer = xlsx.build(data);
      fs.writeFile("茅台净利润(扣除非经常性损益后).xlsx", buffer, "utf-8", (error) => {
          console.log(error);
      });
    });
  }
}

const maotai = new Maotai('http://quotes.money.163.com/f10/zycwzb_600519.html#01c01');
maotai.getData();