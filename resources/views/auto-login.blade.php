<!DOCTYPE html>
<html>
<head>
    <title>Logging in...</title>
</head>
<body>
    <p>Logging you in...</p>
    <form id="loginForm" action="/login" method="POST" style="display: none;">
        @csrf
        <input type="email" name="email" value="{{ $email }}">
        <input type="password" name="password" value="{{ $password }}">
    </form>
    <script>
        document.getElementById('loginForm').submit();
    </script>
</body>
</html>