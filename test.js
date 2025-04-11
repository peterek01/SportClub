// Napisz funkcję JavaScript, która znajdzie pierwszy niepowtarzający się znak.
function firstChar(str) {
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (str.indexOf(char) === str.lastIndexOf(char)) {
            return char;
        }
    }
    return null;
}

console.log(firstChar("sdkdjlekjklsehgn"))


// Napisz funkcję, która zwraca silnię (factorial) liczby.
function factorial(num) {
    if (num === 0 || num === 1) return 1;

    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    return result;
}

console.log(factorial(5));


// Napisz funkcję wyższego rzędu, która przyjmuje funkcję i wartość, a następnie stosuje tę funkcję dwukrotnie.
function applyTwice(fn, value) {
    return fn(fn(value));
}

function double(x) {
    return x * 2;
}

console.log(applyTwice(double, 3));


// Utwórz funkcję, która zwraca inną funkcję.
function sayHello(name) {
    console.log(`Hello ${name}!`);
}

function yourName(call) {
    const n = "John";
    return call(n);
}

yourName(sayHello);



// Create a Simple Component in React
import React from "react";

function Header(props) {
    return (
        <div>
            <h1>Welcome!</h1>
            <p>Welcome {props.name}</p>
        </div>
    );
}

function App() {
    return (
        <div>
            <Header name="John" />
        </div>
    )
}


// Render a List from an Array
// import React from "react";

// function listNames() {
//     const list = ["Piter", "Alice", "John", "Emma"];

//     return (
//         <ul>
//             {list.map((name, index) => (
//                 <li key={index}>{name}</li>
//             ))}
//         </ul>
//     )
// }

// export default listNames;


// Use useEffect to Fetch Data
import { useEffect, useState } from "react";

function useFetch() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://jsonplaceholder.typicode.com/users")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.log("Error data download", err);
            });
    }, []);

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div>
            <h1>List of Users:</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
}


// Example Interval with clean up function
useEffect(() => {
    const interval = setInterval(() => {
        console.log("1 sek");
    }, 1000);

    const stop = setTimeout(() => {
        clearInterval(interval);
        console.log("Stop");
    }, 5000);

    return () => {
        clearInterval(interval);
        clearTimeout(stop);
    };
}, []);



import React from "react";
import { useEffect, useState } from "react-router-dom";