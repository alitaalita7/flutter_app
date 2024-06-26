const { User } = require('../models/models');

class UserController {

  async signup(req, res, next) {

    try {
      console.log(req.body);
      const { login, password, school_class } = req.body;

      console.log('Получен запрос на регистрацию пользователя:', req.body);

      // Проверяем, существует ли пользователь с таким логином
      const existingUser = await User.findOne({ where: { login } });
      if (existingUser) {
        return res.json({ message: 'Пользователь с таким логином уже существует' });
      }

      // Создаем нового пользователя в базе данных
      const newUser = await User.create({
        login,
        password,
        school_class,
        coins: 0,
        xp: 0,
        completed_achievements: [],
        completed_goals: [],
        selected_goal: null
      });

      console.log('Новый пользователь успешно создан:', newUser);

      // Отправляем ответ с сообщением об успешной регистрации
      return res.json({ message: 'Регистрация прошла успешно', user: newUser });
    } catch (error) {
      console.error('Ошибка регистрации:', error.message);
      next(error);
    }
  }

  // Контроллер для аутентификации пользователя
  async login(req, res) {
    try {
      const { login, password } = req.body;

      // Поиск пользователя по логину
      const user = await User.findOne({ where: { login: login } });

      // Проверка, существует ли пользователь с таким логином
      if (!user) {
        return res.status(401).json({ error: 'Логин не найден' });
      }

      console.log(user, user.password, password);

      // Проверка правильности пароля
      if (user.password !== password) {
        return res.status(401).json({ error: 'Неверный пароль' });
      }

      res.status(200).json({ message: 'Аутентификация успешна', user });
    } catch (error) {
      console.error('Ошибка при аутентификации:', error.message);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  };

  // Контроллер для обновления данных пользователя
  async updateUserData(req, res, next) {
    const { user_id, login, password, school_class } = req.body;
    try {
      const user = await User.findByPk(user_id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Проверяем, существует ли пользователь с таким логином
      const existingUser = await User.findOne({ where: { login } });
      if (existingUser) {
        return res.json({ message: 'Пользователь с таким логином уже существует' });
      }

      user.login = login;
      user.password = password;
      user.school_class = school_class;
      user.changed('login', true);
      user.changed('password', true);
      user.changed('school_class', true);
      await user.save();
      res.status(200).json({ message: "User's login, password and school class changed successfully", user });
    } catch (error) {
      console.error("Error changing user's login, password or school class:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Контроллер для удаления изображения пользователя
  async deleteImage(req, res, next) {
    try {
      const userId = req.body.userId; // Получаем идентификатор пользователя из запроса
      const user = await User.findByPk(userId); // Находим пользователя по идентификатору
      console.log(user);
      // Проверяем, существует ли пользователь
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Удаляем изображение пользователя
      user.image = null; // Устанавливаем изображение пользователя как null или пустую строку, в зависимости от вашей модели
      await user.save(); // Сохраняем изменения

      console.log('Изображение пользователя успешно удалено');

      // Отправляем ответ с сообщением об успешном удалении изображения
      return res.json({ message: 'Изображение пользователя успешно удалено' });
    } catch (error) {
      console.error('Ошибка при удалении изображения пользователя:', error.message);
      next(error);
    }
  }


  // Контроллер для обновления изображения пользователя
  async updateImage(req, res, next) {
    try {
      const userId = req.body.userId;
      const image = req.body.image // Получаем идентификатор пользователя и URI изображения из тела запроса

      console.log('Получен запрос на обновление изображения пользователя:', userId, image);

      // Находим пользователя по идентификатору
      const user = await User.findByPk(userId);

      // Проверяем, существует ли пользователь с указанным идентификатором
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Обновляем изображение пользователя в базе данных
      user.image = image;
      await user.save();

      console.log('Изображение пользователя успешно обновлено:', user.image);

      // Отправляем ответ с сообщением об успешном обновлении изображения
      return res.json({ message: 'Изображение пользователя успешно обновлено', user });
    } catch (error) {
      console.error('Ошибка при обновлении изображения пользователя:', error.message);
      next(error);
    }
  }

  // Контроллер для смены пароля пользователя
  async changePassword(req, res) {
    try {
      const { userId, newPassword } = req.body;

      // Находим пользователя по его идентификатору
      const user = await User.findByPk(userId);

      // Проверяем, существует ли пользователь
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Обновляем пароль пользователя в базе данных
      user.password = newPassword;
      await user.save();

      console.log('Пароль пользователя успешно обновлен');
      return res.json({ message: 'Пароль пользователя успешно обновлен' });
    } catch (error) {
      console.error('Ошибка при смене пароля пользователя:', error.message);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      // Находим пользователя по его ID
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Отправляем информацию о пользователе в ответе
      return res.json(user);
    } catch (error) {
      console.error('Ошибка при получении информации о пользователе:', error.message);
      next(error);
    }
  }

  async addCompletedGoal(req, res) {
    const { user_id, goal_id, cost } = req.body;
    try {
      const user = await User.findByPk(user_id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.completed_goals.includes(goal_id)) return res.status(400).json({ message: "Goal already completed" });
      user.completed_goals.push(goal_id);
      user.selected_goal = null;
      user.coins = user.coins - cost;
      // Явное указание, что поле изменено
      user.changed('completed_goals', true);
      user.changed('selected_goal', true);
      user.changed('coins', true)
      await user.save();
      res.status(200).json({ message: "Completed goal added successfully", user });
    } catch (error) {
      console.error("Error adding completed goal:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async setSelectedGoal(req, res) {
    const { user_id, goal_id } = req.body;
    try {
      const user = await User.findByPk(user_id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.selected_goal) return res.status(400).json({ message: "Goal already selected" });
      user.selected_goal = goal_id;
      await user.save();
      res.status(200).json({ message: "Selected goal id added successfully", user });
    } catch (error) {
      console.error("Error selecting goal:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async addCompletedAchievement(req, res) {
    const { user_id, achievement_id, cost, coins } = req.body;
    try {
      const user = await User.findByPk(user_id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.completed_achievements.includes(achievement_id)) return res.status(400).json({ message: "Achievement already completed" });
      user.completed_achievements.push(achievement_id);
      // user.xp = user.xp - cost; отнималась XP
      user.coins = user.coins + coins;
      user.changed('completed_achievements', true);
      user.changed('xp', true);
      user.changed('coins', true);
      await user.save();
      res.status(200).json({ message: "Completed achievement added successfully", user });
    } catch (error) {
      console.error("Error adding completed achievement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async acceptUserAnswer(req, res) {
    const { user_id, is_correct, seconds } = req.body;
    try {
      const user = await User.findByPk(user_id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Если ответ правильный, то прибавляем 5 коинов, иначе отнимаем
      if (is_correct) {
        user.coins = user.coins + 5;

        // В зависимости от класса разное количество секунд на решение примера для получения xp
        switch (user.school_class) {
          case 1:
            if (seconds <= 3) user.xp = user.xp + 2;
            else user.xp = user.xp + 0;
            break;
          case 2:
            if (seconds <= 10) user.xp = user.xp + 2;
            else user.xp = user.xp + 0;
            break;
          case 3:
            if (seconds <= 10) user.xp = user.xp + 2;
            else user.xp = user.xp + 0;
            break;
          case 4:
            if (seconds <= 20) user.xp = user.xp + 2;
            else user.xp = user.xp + 0;
            break;
        }
      } else {
        // Если у пользователя меньше 5 монет, отнимаем все его монеты
        if (user.coins < 5) {
          user.coins = 0;
        } else {
          user.coins -= 5;
        }
      }

      user.changed('coins', true);
      user.changed('xp', true);
      await user.save();
      res.status(200).json({ message: "Completed achievement added successfully", user });
    } catch (error) {
      console.error("Error accept user answer:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

}
module.exports = new UserController();
