<?php
require_once("include/connection.php");
require_once("include/functions.php");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// If the user is already logged in, redirect to the main page.
if (isset($_SESSION['userid'])) {
    header('Location: index.php');
    exit();
}

$error_message = '';

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['login'])) {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $remember_me = isset($_POST['remember_me']);

    if (empty($username) || empty($password)) {
        $error_message = "Username and password are required.";
    } else {
        // First, get the user ID to build the legacy password hash
        $stmt_id = $conn->prepare("SELECT id FROM {$DBPrefix}risorse WHERE username = ?");
        $stmt_id->bind_param('s', $username);
        $stmt_id->execute();
        $result_id = $stmt_id->get_result();

        if ($result_id->num_rows === 1) {
            $user_id_row = $result_id->fetch_assoc();
            $user_id = $user_id_row['id'];
            
            // Legacy password check
            $legacy_password_hash = md5($password) . ":" . md5($user_id);

            $stmt = $conn->prepare(
                "SELECT id, id_ruolo, nome, cognome, password, sesso, mode FROM {$DBPrefix}risorse WHERE username = ?"
            );
            $stmt->bind_param('s', $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 1) {
                $user = $result->fetch_assoc();

                // Check against modern hash first, then legacy
                if (password_verify($password, $user['password'])) {
                    // Password is correct. Upgrade hash if it's still the legacy one.
                    // The auth_user.php script now handles this check and potential upgrade.
                    $password_ok = true;
                } else if ($user['password'] === $legacy_password_hash) {
                    // Legacy password is correct, upgrade it now.
                    $new_hash = password_hash($password, PASSWORD_DEFAULT);
                    $upgrade_stmt = $conn->prepare("UPDATE {$DBPrefix}risorse SET password = ? WHERE id = ?");
                    $upgrade_stmt->bind_param('si', $new_hash, $user['id']);
                    $upgrade_stmt->execute();
                    $password_ok = true;
                } else {
                    $password_ok = false;
                }

                if ($password_ok) {
                    session_regenerate_id(true); // Prevent session fixation

                    // Store user info in session
                    $userinfo = [
                        'id' => $user['id'],
                        'ruolo' => $user['id_ruolo'],
                        'nome' => $user['nome'],
                        'cognome' => $user['cognome'],
                        'sesso' => $user['sesso'],
                        'mode' => $user['mode']
                    ];
                    $_SESSION['userid'] = $userinfo;

                    // Set "remember me" cookie if requested
                    if ($remember_me) {
                        $key = random_string(); // Generate a secure random key
                        $update_key_stmt = $conn->prepare("UPDATE {$DBPrefix}risorse SET rand_key = ? WHERE id = ?");
                        $update_key_stmt->bind_param('si', $key, $user['id']);
                        $update_key_stmt->execute();

                        $cookie_duration = time() + (60 * 60 * 24 * 30); // 30 days
                        setcookie('id', $user['id'], $cookie_duration, '/', null, false, true);
                        setcookie('key', $key, $cookie_duration, '/', null, false, true);
                    }

                    // Update last access info
                    lastaccess($conn, $user['id'], $_SERVER['REMOTE_ADDR'], $DBPrefix);
                    
                    // Redirect to the main page
                    header("Location: index.php");
                    exit();
                } else {
                    $error_message = "Invalid username or password.";
                }
            }
        } else {
            $error_message = "Invalid username or password.";
        }

        if ($stmt) $stmt->close();
        if ($stmt_id) $stmt_id->close();
    }
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - zoneCalculator</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f8f9fa;
        }
        .login-card {
            max-width: 400px;
            width: 100%;
        }
    </style>
</head>
<body>

<div class="card login-card">
    <div class="card-body">
        <h3 class="card-title text-center mb-4">zoneCalculator</h3>
        
        <?php if (!empty($error_message)): ?>
            <div class="alert alert-danger" role="alert">
                <?php echo $error_message; ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_GET['status']) && $_GET['status'] === 'loggedout'): ?>
             <div class="alert alert-success" role="alert">
                You have been successfully logged out.
            </div>
        <?php endif; ?>

        <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>">
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" name="username" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" required>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="remember_me" name="remember_me">
                <label class="form-check-label" for="remember_me">Remember me</label>
            </div>
            <div class="d-grid">
                <button type="submit" name="login" class="btn btn-primary">Login</button>
            </div>
        </form>
    </div>
    <div class="card-footer text-center">
        <small class="text-muted">&copy; 2007-<?php echo date("Y"); ?> MB</small>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
