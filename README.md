# Zone Calculator

Zone Calculator is a web application designed to help users manage their meals according to the Zone Diet. It allows users to calculate their protein needs, browse a list of food items, create meals, and organize them on a calendar.

## Features

*   **Zone Calculator**: Calculate your daily protein needs and "blocks" based on your body measurements and activity level.
*   **Food Management**: Browse a comprehensive list of food items with their nutritional values (proteins, carbohydrates, and fats).
*   **Meal Creation**: Create custom meals by combining different food items and specifying their quantities.
*   **Meal Calendar**: Organize your meals on a weekly calendar.
*   **Infographics**: Visualize your nutritional data.
*   **User and Role Management**: Supports user registration, login, and role-based access control (Admin, User).

## Database Schema

The application uses a MySQL database with the following tables:

*   `alimenti`: Stores food items and their nutritional information.
*   `calendar_items`: Manages the calendar by linking users to their meals for each day.
*   `features`: Defines the application's features and their corresponding pages.
*   `fonte`: Describes the source and reliability of the food data.
*   `opzioni`: Stores application settings, such as language.
*   `pasti`: Represents user-created meals.
*   `pasti_alimenti`: Maps meals to their constituent food items and quantities.
*   `prot_need`: Stores user data for protein need calculations.
*   `risorse`: The users table.
*   `ruoli`: Defines user roles.
*   `ruoli_features`: Maps features to roles to manage access control.
*   `tipo`: Defines food types (e.g., Carne, Pesce).

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Database Setup:**
    *   Import the `zoneCalculator.sql` file into your MySQL database.
    *   Configure the database connection in `include/config.php` by updating the following variables:
        ```php
        $DB_HOST = 'your_database_host';
        $DB_USER = 'your_database_user';
        $DB_PASS = 'your_database_password';
        $DB_NAME = 'your_database_name';
        ```
3.  **Web Server:**
    *   Make sure you have a web server (like Apache or Nginx) with PHP support.
    *   Point your web server's document root to the project directory.

## Usage

Once the application is set up, you can open it in your web browser. You can register a new account or log in with the default credentials:

*   **Username**: admin
*   **Password**: admin

## Contributing

Contributions are welcome! If you want to contribute to the project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with a descriptive message.
4.  Push your changes to your fork.
5.  Create a pull request to the main repository.

Alternatively, you can use the `gitUpdate.sh` script to commit and push your changes.

```bash
./gitUpdate.sh
```
