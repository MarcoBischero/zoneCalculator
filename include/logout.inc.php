<?php
// This file generates the user dropdown menu for the navigation bar.

if (isset($_SESSION['userid'])) {
    // Fetch the user's name and surname from the session.
    $nome = $_SESSION['userid']['nome'] ?? 'User';
    $cognome = $_SESSION['userid']['cognome'] ?? '';
?>
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-user"></i> <?php echo htmlspecialchars($nome . ' ' . $cognome); ?>
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
            <li><a class="dropdown-item" href="index.php?pg=profile.php"><i class="fas fa-user-cog"></i> Profile</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="index.php?logout=1"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
        </ul>
    </li>
<?php
} else {
    // If the user is not logged in, display a login link.
?>
    <li class="nav-item">
        <a class="nav-link" href="login.php">
            <i class="fas fa-sign-in-alt"></i> Login
        </a>
    </li>
<?php
}
?>
