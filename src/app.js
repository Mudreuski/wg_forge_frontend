// this is an example of improting data from JSON
import orders from '../data/orders.json';
import companies from '../data/companies.json';
import users from '../data/users.json';

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

        return `
        <tr id="order_${record.id}">
            <td>${record.transaction_id}</td>
            <td class="user_data">${record.user_id}</td>
            <td>${time}</td>
            <td>$${record.total}</td>
            <td>${cardResult}</td>
            <td>${record.card_type}</td>
            <td>${record.order_country} (${record.order_ip})</td>
        </tr>
        `
    }).join('')

    const table = `
    <table>
        <thead>
            <tr>
                <th>Transaction ID</th>
                <th>User Info</th>
                <th>Order Date</th>
                <th>Order Amount</th>
                <th>Card Number</th>
                <th>Card Type</th>
                <th>Location</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table> `;

    const mailEl = document.getElementById("app");
    mailEl.innerHTML = table;
}());
