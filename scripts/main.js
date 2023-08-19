// Fetch necessary HTML elements
const aList = document.querySelector('#a-list');
const aNameInput = document.querySelector('#a-name');
const aDueDateInput = document.querySelector('#a-due-date');
const aInfoInput = document.querySelector('#a-info');
const aForm = document.querySelector('#a-form');
const aSubmitBtn = document.querySelector('#a-submit-btn');

const tList = document.querySelector('#t-list');
const tNameInput = document.querySelector('#t-name');
const tColorInput = document.querySelector('#t-color');
const tForm = document.querySelector('#t-form');
const tSubmitBtn = document.querySelector('#t-submit-btn');

// Set up database
let db;

const openRequest = window.indexedDB.open('app_db', 1);

openRequest.addEventListener('error', () => {
    console.error('Database failed to open.');
});

openRequest.addEventListener('success', () => {
    console.log('Database opened successfully');

    db = openRequest.result;

    aDisplayData();
    // tDisplayData();
});

openRequest.addEventListener('upgradeneeded', (e) => {
    db = e.target.result;

    const aObjectStore = db.createObjectStore('a_os', {
        keyPath: 'id',
        autoIncrement: true
    });

    aObjectStore.createIndex('a_name', 'a_name', { unique: false });
    aObjectStore.createIndex('a_due_date', 'a_due_date', { unique: false });
    aObjectStore.createIndex('a_info', 'a_info', { unique: false });

    const tObjectStore = db.createObjectStore('t_os', {
        keyPath: 'id',
        autoIncrement: true
    });

    tObjectStore.createIndex('t_name', 't_name', { unique: false });
    tObjectStore.createIndex('t_color', 't_color', { unique: false });
});

// Add data to database
aForm.addEventListener('submit', aAddData);
tForm.addEventListener('submit', tAddData);

function aAddData(e) {
    e.preventDefault;

    const newItem = {
        name: aNameInput.value,
        dueDate: aDueDateInput.value,
        info: aInfoInput.value
    };

    const transaction = db.transaction(['a_os'], 'readwrite');

    const objectStore = transaction.objectStore('a_os');

    const addRequest = objectStore.add(newItem);

    addRequest.addEventListener('success', () => {
        aNameInput.value = '';
        aDueDateInput.value = '';
        aInfoInput.value = '';
    });

    transaction.addEventListener('complete', () => {
        console.log('Transaction complete: Database modification finished.');

        aDisplayData();
    });

    transaction.addEventListener('error', () => {
        console.log('Transaction not opened due to error.');
    });
};

function tAddData(e) {
    e.preventDefault;

    const newItem = {
        name: tNameInput.value,
        color: tColorInput.value
    };

    const transaction = db.transaction(['t_os'], 'readwrite');

    const objectStore = transaction.objectStore('t_os');

    const addRequest = objectStore.add(newItem);

    addRequest.addEventListener('success', () => {
        tNameInput.value = '';
        tColorInput.value = '';
    });

    transaction.addEventListener('complete', () => {
        console.log('Transaction complete: Database modification finished.');

        tDisplayData();
    });

    transaction.addEventListener('error', () => {
        console.log('Transaction not opened due to error.');
    });
};

// Display data
function aDisplayData() {
    while(aList.firstChild) {
        aList.removeChild(aList.firstChild);
    };

    const objectStore = db.transaction('a_os').objectStore('a_os');
    objectStore.openCursor().addEventListener('success', (e) => {
        const cursor = e.target.result;

        if (cursor) {
            const rawDueDate = cursor.value.dueDate.split('-');
            const dueDate = `${rawDueDate[1]}/${rawDueDate[2]}/${rawDueDate[0]}`;
            const daysUntilDue = getDaysUntilDue(cursor.value.dueDate);

            const listItem = document.createElement('li');
            const topDiv = document.createElement('div');
            const titleText = document.createElement('h3');
            const dueDateText = document.createElement('p');
            const infoText = document.createElement('p');

            listItem.classList.add('a-li');
            topDiv.classList.add('a-li-top', 'padded');
            dueDateText.classList.add('a-li-due-date');

            listItem.setAttribute('data-node-id', cursor.value.id);

            titleText.textContent = cursor.value.name;
            dueDateText.textContent = `Due: ${dueDate}`;
            infoText.textContent = (cursor.value.info === '') ? 'No additional information has been provided for this assignment.' : cursor.value.info;

            topDiv.appendChild(titleText);
            listItem.appendChild(topDiv);
            listItem.appendChild(dueDateText);
            listItem.appendChild(infoText);
            aList.appendChild(listItem);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('a-li-delete-btn');
            deleteBtn.textContent = 'Delete';

            deleteBtn.addEventListener('click', aDeleteItem);

            listItem.appendChild(deleteBtn);

            const labelDiv = document.createElement('div');
            const labelTitle = document.createElement('p');
            const label = document.createElement('p');

            labelDiv.classList.add('a-li-label-container');
            label.classList.add('a-li-label');

            if (daysUntilDue <= 1) {
                label.classList.add('bg-red');
            } else if (daysUntilDue <= 3 && daysUntilDue > 1) {
                label.classList.add('bg-orange');
            }

            labelTitle.textContent = `${(daysUntilDue <= 0) ? '' : 'Due in:'}`;
            label.textContent = `${(daysUntilDue === 0) ? 'Due today' : (daysUntilDue < 0) ? 'Overdue' : `${daysUntilDue} day${(daysUntilDue === 1) ? '' : 's'}`}`;

            labelDiv.appendChild(labelTitle);
            labelDiv.appendChild(label);
            topDiv.appendChild(labelDiv);

            cursor.continue();
        } else {
            if (!aList.firstChild) {
                const listItem = document.createElement('li');
                listItem.textContent = 'No assignments stored';

                aList.appendChild(listItem);
            }

            console.log('All assignments displayed');
        }
    });

    aDueDateInput.min = getDate();
};

function tDisplayData() {
    while(tList.firstChild) {
        tList.removeChild(tList.firstChild);
    };

    const objectStore = db.transaction('t_os').objectStore('t_os');
    objectStore.openCursor().addEventListener('success', (e) => {
        const cursor = e.target.result;

        if (cursor) {
            const listItem = document.createElement('li');

            listItem.setAttribute('data-node-id', cursor.value.id);

            listItem.textContent = cursor.value.name;

            tList.appendChild(listItem);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('t-li-delete-btn');
            deleteBtn.textContent = 'Delete';

            deleteBtn.addEventListener('click', tDeleteItem);

            listItem.appendChild(deleteBtn);

            cursor.continue();
        } else {
            if (!tList.firstChild) {
                const listItem = document.createElement('li');
                listItem.textContent = 'No tags stored';

                tList.appendChild(listItem);
            }

            console.log('All tags loaded');
        }
    });
};

// Remove data
function aDeleteItem(e) {
    const ID = Number(e.target.parentNode.getAttribute('data-node-id'));

    const transaction = db.transaction(['a_os'], 'readwrite');
    const objectStore = transaction.objectStore('a_os');
    const deleteRequest = objectStore.delete(ID);

    transaction.addEventListener('complete', () => {
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        console.log(`Assignment ${ID} deleted`);

        if (!aList.firstChild) {
            const listItem = document.createElement('li');

            listItem.textContent = 'No assignments stored';
            aList.appendChild(listItem);
        }
    });
};

function tDeleteItem(e) {
    const ID = Number(e.target.parentNode.getAttribute('data-node-id'));

    const transaction = db.transaction(['t_os'], 'readwrite');
    const objectStore = transaction.objectStore('t_os');
    const deleteRequest = objectStore.delete(ID);

    transaction.addEventListener('complete', () => {
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        console.log(`Tag ${ID} deleted`);

        if (!tList.firstChild) {
            const listItem = document.createElement('li');

            listItem.textContent = 'No tags stored';
            tList.appendChild(listItem);
        }
    });
};

// Date functions
function getDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    return `${year}-${month}-${day}`;
};

function getDaysUntilDue(d) {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    const formattedDate = new Date(`${month}/${day}/${year}`);

    const dueDate = d.split('-');
    const formattedDueDate = new Date(`${dueDate[1]}/${dueDate[2]}/${dueDate[0]}`);

    const diffInTime = formattedDueDate.getTime() - formattedDate.getTime(); 
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
    return diffInDays;
};
