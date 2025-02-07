function displayView() {
    const appDiv = document.getElementById("app");
    const welcomeView = document.getElementById("welcomeview");
    const profileView = document.getElementById("profileview");

    if (!appDiv || !welcomeView || !profileView) {
        console.error("Error: One or more views are missing!");
        return;
    }

    if (localStorage.getItem("token")) {
        appDiv.innerHTML = profileView.innerHTML;
        setupProfileView();
    } else {
        appDiv.innerHTML = welcomeView.innerHTML;
        setupWelcomeView();
    }
}

// 📌 サインイン・サインアップ画面のセットアップ
function setupWelcomeView() {
    document.getElementById("signin-button").addEventListener("click", validateLogin);
    document.getElementById("signup-button").addEventListener("click", signUp);
}

// 📌 サインイン処理
function validateLogin() {
    let email = document.getElementById("signin-email").value.trim();
    let password = document.getElementById("signin-password").value.trim();
    
    let errorMessage = "";

    if (!email || !password) {
        errorMessage = "Email and Password cannot be empty.";
    } else if (!validateEmail(email)) {
        errorMessage = "Invalid email format.";
    } else if (!checkCredentials(email, password)) { // 🔥 追加: 登録済みの情報かチェック
        errorMessage = "Incorrect email or password.";
    }

    if (errorMessage) {
        alert(errorMessage);
        return;
    }

    signIn(email);
}

// 📌 サインアップ処理（情報を正しく保存）
function signUp() {
    let firstName = document.getElementById("signup-firstname").value.trim();
    let familyName = document.getElementById("signup-familyname").value.trim();
    let email = document.getElementById("signup-email").value.trim();
    let password = document.getElementById("signup-password").value;
    let passwordRepeat = document.getElementById("signup-password-repeat").value;
    let city = document.getElementById("signup-city").value.trim();
    let country = document.getElementById("signup-country").value.trim();
    let gender = document.getElementById("signup-gender").value;

    let errorMessage = "";

    if (!firstName || !familyName || !email || !password || !passwordRepeat || !city || !country) {
        errorMessage = "All fields must be filled.";
    } else if (!validateEmail(email)) {
        errorMessage = "Invalid email format.";
    } else if (password.length < 8) {
        errorMessage = "Password must be at least 8 characters.";
    } else if (password !== passwordRepeat) {
        errorMessage = "Passwords do not match.";
    } else if (isEmailRegistered(email)) {
        errorMessage = "Email is already registered.";
    }

    if (errorMessage) {
        alert(errorMessage);
        return;
    }

    // 🔥 すべての情報を保存
    saveUser({
        email,
        password,
        firstName,
        familyName,
        city,
        country,
        gender
    });

    alert("Signup successful! You can now log in.");
}

// 📌 saveUser で個人情報を保存
function saveUser(userData) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(userData);
    localStorage.setItem("users", JSON.stringify(users));
}

// 📌 ログイン処理
function signIn(email) {
    localStorage.setItem("token", email);
    displayView();
}

// 📌 サインアウト処理
function signOut() {
    localStorage.removeItem("token");
    displayView();
}

// 📌 登録済みのユーザー情報をチェック
function isEmailRegistered(email) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    return users.some(user => user.email === email);
}

// 📌 入力されたメール・パスワードが登録済みかチェック
function checkCredentials(email, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    return users.some(user => user.email === email && user.password === password);
}

// 📌 メールアドレスの形式チェック
function validateEmail(email) {
    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

// 📌 パスワード変更処理（修正）
function changePassword() {
    let currentPassword = document.getElementById("current-password").value;
    let newPassword = document.getElementById("new-password").value;
    let repeatNewPassword = document.getElementById("repeat-new-password").value;
    let userEmail = localStorage.getItem("token");

    if (!currentPassword || !newPassword || !repeatNewPassword) {
        alert("All fields must be filled.");
        return;
    }

    if (newPassword.length < 8) {
        alert("New password must be at least 8 characters.");
        return;
    }

    if (newPassword !== repeatNewPassword) {
        alert("New passwords do not match.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let userIndex = users.findIndex(user => user.email === userEmail);

    if (userIndex === -1 || users[userIndex].password !== currentPassword) {
        alert("Current password is incorrect.");
        return;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));
    
    alert("Password successfully changed!");
}

// 📌 プロフィール画面のセットアップ
function setupProfileView() {
    document.getElementById("signout-button").addEventListener("click", signOut);
    document.getElementById("change-password-button").addEventListener("click", changePassword);
    document.getElementById("post-message-button").addEventListener("click", postMessage);
    document.getElementById("search-user-button").addEventListener("click", searchUser);
    document.getElementById("searched-user-post-message-button").addEventListener("click", postMessageToSearchedUser);
    document.getElementById("reload-searched-user-messages-button").addEventListener("click", () => {
        let searchEmail = document.getElementById("search-user-email").value.trim();
        if (searchEmail) {
            displaySearchedUserMessages(searchEmail);
        }
    });

    displayUserInfo();
    loadAllMessages();
    setupTabs();
}

// 📌 ログインユーザーの情報を表示する関数
function displayUserInfo() {
    let userEmail = localStorage.getItem("token");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    
    let user = users.find(user => user.email === userEmail);
    if (!user) return;

    document.getElementById("username").textContent = user.email;
    document.getElementById("profile-firstname").textContent = user.firstName || "N/A";
    document.getElementById("profile-familyname").textContent = user.familyName || "N/A";
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-gender").textContent = user.gender || "N/A";
    document.getElementById("profile-city").textContent = user.city || "N/A";
    document.getElementById("profile-country").textContent = user.country || "N/A";
}

// 📌 メッセージ投稿処理（新しい投稿が上に表示されるようにする）
function postMessage() {
    let messageInput = document.getElementById("message-input").value.trim();
    if (!messageInput) {
        alert("Message cannot be empty!");
        return;
    }

    let userEmail = localStorage.getItem("token");
    if (!userEmail) {
        alert("You must be logged in to post a message.");
        return;
    }

    // 🔥 ローカルストレージに保存（先頭に追加）
    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    messages.unshift({ user: userEmail, text: messageInput, timestamp: Date.now() }); // 🔥 unshift で一番上に
    localStorage.setItem("messages", JSON.stringify(messages));

    // メッセージ一覧を更新
    loadAllMessages();

    // 入力欄をクリア
    document.getElementById("message-input").value = "";
}

// 📌 すべてのメッセージを表示（新しい順）
function loadAllMessages() {
    let allMessagesDiv = document.getElementById("all-messages-list");
    let messages = JSON.parse(localStorage.getItem("messages")) || [];

    allMessagesDiv.innerHTML = ""; // 一旦クリア

    // 🔥 新しい投稿が上に来るように逆順でループ
    messages.sort((a, b) => b.timestamp - a.timestamp); // 🔥 最新の投稿が一番上
    messages.forEach((msg) => {
        let messageElement = document.createElement("div");
        messageElement.classList.add("message-card");
        messageElement.textContent = `${msg.user}: ${msg.text}`;
        allMessagesDiv.appendChild(messageElement);
    });
}

// 📌 他のユーザーの情報と投稿を取得し、表示する
function searchUser() {
    let searchEmail = document.getElementById("search-user-email").value.trim();
    if (!searchEmail) {
        alert("Please enter an email to search.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === searchEmail);

    let profileDiv = document.getElementById("searched-user-info");
    let messagesDiv = document.getElementById("searched-user-messages-list");

    if (!user) {
        profileDiv.innerHTML = "<p>User not found.</p>";
        messagesDiv.innerHTML = "";
        return;
    }

    // 🔹 プロフィール情報を表示
    document.getElementById("searched-profile-firstname").textContent = user.firstName;
    document.getElementById("searched-profile-familyname").textContent = user.familyName;
    document.getElementById("searched-profile-email").textContent = user.email;
    document.getElementById("searched-profile-gender").textContent = user.gender;
    document.getElementById("searched-profile-city").textContent = user.city;
    document.getElementById("searched-profile-country").textContent = user.country;

    // 🔹 メッセージ一覧を表示
    displaySearchedUserMessages(searchEmail);
}

// 📌 他のユーザーの投稿を表示
function displaySearchedUserMessages(email) {
    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    let userMessages = messages.filter(msg => msg.user === email);
    let messagesDiv = document.getElementById("searched-user-messages-list");

    messagesDiv.innerHTML = "";

    if (userMessages.length === 0) {
        messagesDiv.innerHTML = "<p>No messages found.</p>";
        return;
    }

    userMessages.forEach(msg => {
        let messageElement = document.createElement("div");
        messageElement.classList.add("message-card");
        messageElement.textContent = msg.text;
        messagesDiv.appendChild(messageElement);
    });
}

// 📌 他のユーザーのウォールにメッセージを投稿
function postMessageToSearchedUser() {
    let messageInput = document.getElementById("searched-user-message-input").value.trim();
    let searchEmail = document.getElementById("search-user-email").value.trim();

    if (!messageInput) {
        alert("Message cannot be empty!");
        return;
    }

    if (!searchEmail) {
        alert("No user selected.");
        return;
    }

    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    messages.unshift({ user: searchEmail, text: messageInput, timestamp: Date.now() });
    localStorage.setItem("messages", JSON.stringify(messages));

    // メッセージ一覧を更新
    displaySearchedUserMessages(searchEmail);
    document.getElementById("searched-user-message-input").value = "";
}



// 📌 タブ切り替え処理
function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");

            // すべてのタブを非表示にする
            tabContents.forEach(content => content.classList.add("hidden"));
            tabButtons.forEach(btn => btn.classList.remove("active"));

            // クリックされたタブを表示
            document.getElementById(targetTab).classList.remove("hidden");
            button.classList.add("active");
        });
    });
}

// 📌 ページロード時にビューを表示
window.onload = displayView;
