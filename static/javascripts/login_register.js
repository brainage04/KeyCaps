var showPassword = document.getElementById("showPassword");
showPassword.checked = false;

var password = document.getElementById("password");

function togglePassword() {
	if (password.type === "password") {
		password.type = "text";
	} else {
		password.type = "password";
	}
}