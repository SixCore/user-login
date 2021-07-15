const btnRegister = document.getElementById("btnRegister");
btnRegister.addEventListener("click", () => {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let passwordConfirm = document.getElementById("passwordConfirm").value;
    let info = document.getElementById("info");

    let error = false;

    if(password !== passwordConfirm) {
        error = true;
        info.innerHTML = "passwords don't match";
    }

    if(!password || password.length === 0) {
        error = true;
        info.innerHTML = "password is empty";
    }

    if(!username || username.length === 0) {
        error = true;
        info.innerHTML = "username is empty";
    }

    if(!error) {
        info.innerHTML = "";

        registerUser(username, password)
        .then((result) => {
            if(result.status === 0) {
                // User registered
            }
            else if(result.status === 1) {
                info.innerHTML = "user already in database";
            }
        })
        .catch(err => console.log(err));
    }
});

const registerUser = async (username, password) => {
    const response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username: username, password, password})
    });
    return await response.json();
}
