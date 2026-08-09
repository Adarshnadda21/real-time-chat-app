const socket = io();


// =========================
// ELEMENTS
// =========================

const loginScreen = document.getElementById("loginScreen");

const chatScreen = document.getElementById("chatScreen");

const usernameInput = document.getElementById("usernameInput");

const joinButton = document.getElementById("joinButton");

const messages = document.getElementById("messages");

const messageForm = document.getElementById("messageForm");

const messageInput = document.getElementById("messageInput");

const typingIndicator = document.getElementById("typingIndicator");

const onlineUsers = document.getElementById("onlineUsers");


// =========================
// JOIN CHAT
// =========================

joinButton.addEventListener("click", joinChat);

usernameInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        joinChat();
    }

});


function joinChat() {

    const username = usernameInput.value.trim();

    if (username === "") {
        alert("Please enter your username.");
        return;
    }

    socket.emit("joinChat", username);

    loginScreen.classList.add("hidden");

    chatScreen.classList.remove("hidden");

    messageInput.focus();
}


// =========================
// SEND MESSAGE
// =========================

messageForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    socket.emit("sendMessage", message);

    messageInput.value = "";

    socket.emit("stopTyping");

});


// =========================
// RECEIVE MESSAGE
// =========================

socket.on("receiveMessage", (data) => {

    const messageElement = document.createElement("div");

    messageElement.classList.add("message");

    messageElement.innerHTML = `
        <div class="message-name">
            ${escapeHTML(data.username)}
        </div>

        <div class="message-content">
            ${escapeHTML(data.message)}

            <span class="message-time">
                ${data.time}
            </span>
        </div>
    `;

    messages.appendChild(messageElement);

    scrollToBottom();
});


// =========================
// USER JOINED
// =========================

socket.on("userJoined", (data) => {

    const systemMessage = document.createElement("div");

    systemMessage.classList.add("system-message");

    systemMessage.textContent = data.message;

    messages.appendChild(systemMessage);

    scrollToBottom();
});


// =========================
// USER LEFT
// =========================

socket.on("userLeft", (data) => {

    const systemMessage = document.createElement("div");

    systemMessage.classList.add("system-message");

    systemMessage.textContent = data.message;

    messages.appendChild(systemMessage);

    scrollToBottom();
});


// =========================
// USER COUNT
// =========================

socket.on("userCount", (count) => {

    onlineUsers.textContent =
        `${count} ${count === 1 ? "user" : "users"} online`;

});


// =========================
// TYPING
// =========================

let typingTimeout;

messageInput.addEventListener("input", () => {

    socket.emit("typing");

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {

        socket.emit("stopTyping");

    }, 1000);

});


socket.on("userTyping", (data) => {

    typingIndicator.textContent =
        `${data.username} is typing...`;

});


socket.on("userStoppedTyping", () => {

    typingIndicator.textContent = "";

});


// =========================
// AUTO SCROLL
// =========================

function scrollToBottom() {

    messages.scrollTop = messages.scrollHeight;

}


// =========================
// SECURITY
// =========================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}