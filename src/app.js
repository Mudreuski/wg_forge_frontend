// this is an example of improting data from JSON
import orders from '../data/orders.json';
import companies from '../data/companies.json';
import users from '../data/users.json';
import style from '../dist/style.css';

let ordersTotal = 0;
const medianValue = [];
let checkFemale = 0;
let femaleCount = 0;
let checkMale = 0;
let maleCount = 0;

export default (function () {
    const rows = orders.map((record) => {
        let timestamp = new Date(record.created_at * 1000);
        let year = timestamp.getFullYear();
        let month = timestamp.getMonth() + 1;
        let date = timestamp.getDate();
        let hour = timestamp.getHours();
        let meridiem = "PM";
        if (hour > 11) {
            hour = hour - 12;
            meridiem = "AM";
        }
        let min = timestamp.getMinutes();
        let sec = timestamp.getSeconds();
        let time = date + '/' + month + '/' + year + ', ' + hour + ':' + min + ':' + sec + ' ' + meridiem;
        
        let cardNumber = record.card_number;
        let str = cardNumber.substr(2, cardNumber.length - 6);
        for (let i = 0; i < 10; i++) {
            str = str.replace(new RegExp(i, 'g'), '*');
        }
        let cardResult = cardNumber[0] + cardNumber[1] + str + cardNumber[cardNumber.length-4] + cardNumber[cardNumber.length-3] + cardNumber[cardNumber.length-2] + cardNumber[cardNumber.length-1]

        let usersName = users[record.user_id - 1].first_name + " " + users[record.user_id - 1].last_name;
        let male = "Ms.";
        if (users[record.user_id - 1].gender === "Male") {
            male = "Mr.";
            checkMale += +record.total;
            maleCount +=1;
        } else {
            checkFemale += +record.total;
            femaleCount +=1;
        }

        let timestampBirthday = new Date(users[record.user_id - 1].birthday * 1000);
        let yearBirthday = timestampBirthday.getFullYear();
        let monthBirthday = timestampBirthday.getMonth() + 1;
        let dateBirthday = timestampBirthday.getDate();
        let usersBirthday = dateBirthday + '/' + monthBirthday + '/' + yearBirthday;

        let idCompany = users[record.user_id - 1].company_id - 1;
        let companyTitle = "";
        let companyLink = "";
        let companyLinkTarget = "_blank";
        let companyIndustry = "";
        if (idCompany >= 0) {
            companyTitle = companies[idCompany].title;
            companyLink = companies[idCompany].url;
            companyIndustry = companies[idCompany].industry;
        } else {
            companyTitle = "no information available";
            companyLink = "#";
            companyLinkTarget = "_self";
            companyIndustry = "no information available";
        }

        let usersInfo = `
        <td class="user_data">
            <a href="#" onclick="event.preventDefault()">${male} ${usersName}</a>

            <div class="user-details">
                <p>Birthday: ${usersBirthday}</p>
                <p><img src="${users[record.user_id - 1].avatar}" width="100px"></p>
                <p>Company: <a href="${companyLink}" target="${companyLinkTarget}">${companyTitle}</a></p>
                <p>Industry: ${companyIndustry}</p>
            </div>
        </td>
        `;

        ordersTotal += +record.total;
        medianValue.push(+record.total);

        return `
        <tr id="order_${record.id}">
            <td>${record.transaction_id}</td>
            ${usersInfo}
            <td>${time}</td>
            <td class="cost">$${record.total}</td>
            <td>${cardResult}</td>
            <td>${record.card_type}</td>
            <td>${record.order_country} (${record.order_ip})</td>
            <td class="hide">${usersName}</td>
            <td class="hide">${record.created_at}</td>
        </tr>
        `
    }).join('')

    const table = `
    <table class="table_sort">
        <thead>
            <tr>
                <th colspan="2" class="noTarget">Search:</th>
                <th colspan="5" class="noTarget"><input type="text" id="search"></th>
            </tr>
            <tr>
                <th>Transaction ID</th>
                <th>User Info</th>
                <th>Order Date</th>
                <th>Order Amount</th>
                <th>Card Number</th>
                <th>Card Type</th>
                <th>Location</th>
                <th class="hide">User Info Hide</th>
                <th class="hide">Order Date Hide</th>
            </tr>
            <tr class="hiden" id="notFound" colspan="7">
                <td colspan="7">Nothing found</td>
            </tr>
        </thead>
        <tbody id="info-table">
            ${rows}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2">Orders Count</td>
                <td colspan="5" id="ordersCount">11</td>
            </tr>
            <tr>
                <td colspan="2">Orders Total</td>
                <td colspan="5" id="ordersTotal">$ 6722.72</td>
            </tr>
            <tr>
                <td colspan="2">Median Value</td>
                <td colspan="5" id="medianValue">$ 593.72</td>
            </tr>
            <tr>
                <td colspan="2">Average Check</td>
                <td colspan="5" id="averageCheck">$ 611.16</td>
            </tr>
            <tr>
                <td colspan="2">Average Check (Female)</td>
                <td colspan="5" id="averageCheckFemale">$ 395.18</td>
            </tr>
            <tr>
                <td colspan="2">Average Check (Male)</td>
                <td colspan="5" id="averageCheckMale">$ 692.15</td>
            </tr>
        </tfoot>
    </table> `;

    const mailEl = document.getElementById("app");
    mailEl.innerHTML = table;
   
}());

document.querySelector('tbody').addEventListener('click', ({ target }) => {
    if (target.tagName === 'A') {
        target.parentNode.querySelector('div.user-details').classList.toggle('active');
    } 
});

document.addEventListener('DOMContentLoaded', () => {
    const getSort = ({ target }) => {
        if (target.id === "search") return;
        if (target.classList[0] === "noTarget") return;

        const order = (target.dataset.order = -(target.dataset.order || -1));
        let index = [...target.parentNode.cells].indexOf(target);
        if (index === 4) {
            return;
        } else if (index === 1) {
            index = 7;
        } else if (index === 2) {
            index = 8;
        }

        const collator = new Intl.Collator(['en', 'ru'], { numeric: true });
        const comparator = (index, order) => (a, b) => order * collator.compare(
            a.children[index].innerHTML,
            b.children[index].innerHTML
        );

        for(const tBody of target.closest('table').tBodies)
            tBody.append(...[...tBody.rows].sort(comparator(index, order)));

        for(const cell of target.parentNode.cells)
            cell.classList.toggle('sorted', cell === target);
    };

    document.querySelectorAll('.table_sort thead').forEach(tableTH => tableTH.addEventListener('click', () => getSort(event)));
});


function totalInformation(){
    let tr = document.getElementsByTagName('table').item(0).getElementsByTagName('tr').length;

    let medianResult = 0;

    function compareNumeric(a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
    }
    medianValue.sort(compareNumeric);

    if (medianValue.length % 2 === 0) {
        medianResult = (medianValue[medianValue.length / 2] + medianValue[medianValue.length / 2 - 1]) / 2;
    } else {
        medianResult = medianValue[Math.floor(medianValue.length / 2)];
    }

    document.getElementById('ordersCount').innerHTML = tr - 9;
    document.getElementById('ordersTotal').innerHTML = "$ " + ordersTotal.toFixed(2);
    document.getElementById('medianValue').innerHTML = "$ " + medianResult;
    document.getElementById('averageCheck').innerHTML = "$ " + (ordersTotal / medianValue.length).toFixed(2);
    document.getElementById('averageCheckFemale').innerHTML = "$ " + (checkFemale / femaleCount).toFixed(2);
    document.getElementById('averageCheckMale').innerHTML = "$ " + (checkMale / maleCount).toFixed(2);
}
window.onload=totalInformation; 

document.querySelector('#search').addEventListener('keyup', tableSearch);

function tableSearch() {
    var phrase = document.getElementById('search');
    var table = document.getElementById('info-table');
    var regPhrase = new RegExp(phrase.value, 'i');
    var flag = false;
    let searchCount = 0;
    let medianResult = 0;
    let orderAmount = 0;
    let totalAfterSearch = 0;
    let medianAfterSearch = [];
    let femaleCountAfterSearch = 0;
    let maleCountAfterSearch = 0;
    let checkFemaleAfterSearch = 0;
    let checkMaleAfterSearch = 0;

    for (var i = 0; i < table.rows.length; i++) {
        flag = false;

        if (table.rows[i].style.display != "none") {
            orderAmount = +table.rows[i].cells[3].textContent.slice(1, );
            totalAfterSearch += orderAmount;
             
            medianAfterSearch.push(+table.rows[i].cells[3].textContent.slice(1, ));
            function compareNumeric(a, b) {
                if (a > b) return 1;
                if (a < b) return -1;
            }
            medianAfterSearch.sort(compareNumeric);
            
            if (medianAfterSearch.length % 2 === 0) {
                medianResult = (medianAfterSearch[medianAfterSearch.length / 2] + medianAfterSearch[medianAfterSearch.length / 2 - 1]) / 2;
            } else {
                medianResult = medianAfterSearch[Math.floor(medianAfterSearch.length / 2)];
            }
            console.log(typeof table.rows[i].cells[1].childNodes[1].textContent);
            if (table.rows[i].cells[1].childNodes[1].textContent.indexOf("Mr.") >= 0) {
                checkMaleAfterSearch += orderAmount;
                maleCountAfterSearch += 1;
            } else {
                checkFemaleAfterSearch += orderAmount;
                femaleCountAfterSearch += 1;
            }
        }

        for (var j = table.rows[i].cells.length - 1; j >= 0; j--) {
            flag = regPhrase.test(table.rows[i].cells[j].innerHTML);
            
            if (flag) break;
        }
        if (flag) {
            searchCount +=1;
            table.rows[i].style.display = "";

        } else {
            table.rows[i].style.display = "none";
        } 
    }
    
    if (searchCount > 0) {
        document.querySelector('#notFound').classList.remove('activeFound');
        document.querySelector('#notFound').classList.add('hiden');

        document.getElementById('ordersCount').innerHTML = searchCount;
        document.getElementById('ordersTotal').innerHTML = "$ " + totalAfterSearch.toFixed(2);
        document.getElementById('medianValue').innerHTML = "$ " + medianResult;
        document.getElementById('averageCheck').innerHTML = "$ " + (totalAfterSearch / medianAfterSearch.length).toFixed(2);
        if (femaleCountAfterSearch > 0) {
            document.getElementById('averageCheckFemale').innerHTML = "$ " + (checkFemaleAfterSearch / femaleCountAfterSearch).toFixed(2);
        } else {
            document.getElementById('averageCheckFemale').innerHTML = "n/a";
        }
        if (maleCountAfterSearch > 0) {
            document.getElementById('averageCheckMale').innerHTML = "$ " + (checkMaleAfterSearch / maleCountAfterSearch).toFixed(2);
        } else {
            document.getElementById('averageCheckMale').innerHTML = "n/a";
        } 
    } else {
        document.querySelector('#notFound').classList.remove('hiden');
        document.querySelector('#notFound').classList.add('activeFound');

        document.getElementById('ordersCount').innerHTML = "n/a";
        document.getElementById('ordersTotal').innerHTML = "n/a";
        document.getElementById('medianValue').innerHTML = "n/a";
        document.getElementById('averageCheck').innerHTML = "n/a";
        document.getElementById('averageCheckFemale').innerHTML = "n/a";
        document.getElementById('averageCheckMale').innerHTML = "n/a";
    }
}