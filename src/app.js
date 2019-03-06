// this is an example of improting data from JSON
import orders from '../data/orders.json';
import companies from '../data/companies.json';
import users from '../data/users.json';
import style from '../dist/style.css';

console.log(orders);
console.log(users);
console.log(companies);

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
        
        return `
        <tr id="order_${record.id}">
            <td>${record.transaction_id}</td>
            ${usersInfo}
            <td>${time}</td>
            <td>$${record.total}</td>
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
        </thead>
        <tbody>
            ${rows}
        </tbody>
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