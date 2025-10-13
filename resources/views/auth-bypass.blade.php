<!DOCTYPE html>
<html>
<head>
    <title>InvoiceShelf - Redirecting...</title>
</head>
<body>
    <!-- <p>Setting up your session...</p> -->
    <script>
        // Set token in localStorage (without Bearer prefix - axios will add it)
        localStorage.setItem('auth.token', '{{ $token }}');
        localStorage.setItem('user', JSON.stringify(@json($user)));
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('selectedCompany', '{{ $user->companies->first()->id ?? 5 }}');
        
        // Set cookie for Sanctum (encrypted format that Laravel expects)
        document.cookie = 'sanctum_token={{ $token }}; path=/; max-age=' + (60*60*24*7) + '; SameSite=Lax';
        
        // Test the bootstrap endpoint to ensure authentication works
        console.log('Testing authentication...');
        fetch('/api/v1/bootstrap', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + '{{ $token }}',
                'company': '{{ $user->companies->first()->id ?? 5 }}',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Authentication failed');
        })
        .then(data => {
            console.log('Bootstrap test result:', data);
            if (data.current_user) {
                console.log('Authentication successful, redirecting to dashboard...');
                window.location.href = '/admin/dashboard';
            } else {
                console.error('Authentication failed:', data);
                alert('Authentication failed. Please try logging in again.');
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Bootstrap test failed:', error);
            alert('Authentication test failed. Please try logging in again.');
            window.location.href = '/login';
        });
    </script>
</body>
</html>