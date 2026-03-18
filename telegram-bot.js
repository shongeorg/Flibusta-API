require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.TOKEN);
const API_URL = "https://flibusta-api.vercel.app";

bot.start((ctx) => ctx.reply("Напиши назву книги для пошуку:"));

bot.on("text", async (ctx) => {
  try {
    const { data } = await axios.get(`${API_URL}/api/search`, {
      params: { name: ctx.message.text },
    });

    if (!data.length) return ctx.reply("Нічого не знайдено.");

    const buttons = data
      .slice(0, 8)
      .map((book) => [
        Markup.button.callback(
          `${book.title} - ${book.author}`,
          `dl_${book.id}_${encodeURIComponent(book.title.slice(0, 30))}`,
        ),
      ]);

    ctx.reply("Вибери книгу:", Markup.inlineKeyboard(buttons));
  } catch (e) {
    ctx.reply("Помилка пошуку");
  }
});

bot.action(/^dl_(\d+)_(.+)$/, async (ctx) => {
  const bookId = ctx.match[1];
  const bookTitle = decodeURIComponent(ctx.match[2]);

  await ctx.answerCbQuery("Готую файл...");

  try {
    await ctx.replyWithDocument({
      url: `${API_URL}/api/download/${bookId}?format=epub`,
      filename: `${bookTitle}.epub`,
    });
  } catch (e) {
    ctx.reply(
      "Не вдалося завантажити файл. Можливо, він завеликий для Telegram API.",
    );
  }
});

bot.launch();
