const discord = require('discord.js');
const sharp = require('sharp');
const snekfetch = require('snekfetch');

const bot = new discord.Client();
const config = require('./env');

let cooldown = {};

bot.login(config.token);

bot.on('ready', () => {
  console.log('Blurplefy v1.0.0 is now ready!');
  console.log(`Currently serving ${bot.guilds.size} guilds and ${bot.users.size} users.`);
});

bot.on('message', async (message) => {
  if (message.content.indexOf(config.prefix) == 0) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command == 'help') {

    }
    else if (command == 'blurple' || command == 'blurplefy' || command == 'blurpie' || command == 'blurplify') {
      if (cooldown[message.author.id] == null) {
        cooldown[message.author.id] = Date.now();
      }
      else if (Date.now() - cooldown[message.author.id] > 10000) {
        cooldown[message.author.id] = Date.now();
      }
      else if (message.author.id == config.owner) {
        true;
      }
      else {
        message.reply('please slow down, you still need to wait `'+(10000-Date.now()+cooldown[message.author.id])/1000+'` seconds!');
        return;
      }
      let img = ''
      let link = '';
      if (message.author.displayAvatarURL.indexOf('assets') > -1) {
        link = message.author.displayAvatarURL;
      }
      else {
        link = (message.author.displayAvatarURL.indexOf('gif') > -1) ? message.author.displayAvatarURL.slice(0,-3) + 'png?size=256' : message.author.displayAvatarURL.slice(0,-4) + "256";
      }

      if (message.attachments.first() != null) {
        try {
          link = message.attachments.first().url;
          const tmp = await snekfetch.get(link);
          img = tmp.body;
        }
        catch (e) {
          message.reply('internal error occured! Please contact willi123yao#1345');
          return;
        }
      }
      else if (args[0] == null) {
        try {
          const tmp = await snekfetch.get(link);
          img = tmp.body;
        }
        catch (e) {
          message.reply('internal error occured! Please contact willi123yao#1345');
          return;
        }
      }
      else if (args[0].indexOf('http') == 0) {
        try {
          link = args[0];
          const tmp = await snekfetch.get(link);
          img = tmp.body;
        }
        catch (e) {
          message.reply('invalid link!');
          return;
        }
      }
      else if (args[0].indexOf('<@') == 0) {
        let user = message.mentions.users.first();
        if (user.displayAvatarURL.indexOf('assets') > -1) {
          link = user.displayAvatarURL;
        }
        else {
          link = (user.displayAvatarURL.indexOf('gif') > -1) ? user.displayAvatarURL.slice(0,-3) + 'png?size=256' : user.displayAvatarURL.slice(0,-4) + "256";
        }
        try {
          const tmp = await snekfetch.get(link);
          img = tmp.body;
        }
        catch (e) {
          message.reply('internal error occured! Please contact willi123yao#1345');
          return;
        }
      }
      else {
        try {
          const tmp = await snekfetch.get(link);
          img = tmp.body;
        }
        catch (e) {
          message.reply('internal error occured! Please contact willi123yao#1345');
          return;
        }
      }
      await blurple(message, img, link);
      return;
    }
    else if (command == 'eval') {
      doEval(message);
      return;
    }
  }
});

const blurple = async (message, img, link) => {
  img = await sharp(img).toColorspace('grey16').normalise().toBuffer();
  // img = await enhance1k(img, 0);
  img = await sharp(img).toColorspace('srgb').threshold(180).toBuffer();
  message.channel.sendFile(img);
  const meta = await sharp(img).metadata();
  sharp(img).raw().toBuffer(async (err, rgbaBuffer, info) => {
    const olddata = Buffer.from(rgbaBuffer).toString('hex').toString();
    let newdata = '';
    let i = 0;
    if (meta.channels == 3) {
      while (i < olddata.length) {
        newdata = newdata + parseBlurple2(olddata.substr(i, 6));
        i = i + 6;
      }
    }
    else if (meta.channels == 4) {
      while (i < olddata.length) {
        newdata = newdata + parseBlurple2(olddata.substr(i, 6)) + 'ff';
        i = i + 8;
      }
    }
    newdata = Buffer.from(newdata, 'hex');
    let done = await sharp(newdata, {raw: {
        width: meta.width,
        height: meta.height,
        channels: meta.channels
    }}).png().toBuffer();
    const embed = {
      color: 0x7289da,
      thumbnail: {
        url: link
      },
      image: {
        url: "attachment://image.png"
      },
      footer: {
        text: `Please note - This blurplefier is automated and therefore may not always give you the best result. | Content requested by ${message.author.tag}`
      }
    }
    message.channel.send({embed: embed, files: [{name: "image.png", attachment: done}]});
  });
}

const enhance1k = async (imgbuf, count) => {
  imgbuf = await sharp(imgbuf).normalise().toBuffer();
  if (count < 100) {
    console.log(count);
    return await enhance1k(imgbuf, count+1);
  }
  else {
    return imgbuf;
  }
}

function parseBlurple (c) {
  const r = parseInt(c.substr(1,2),16);
  const g = parseInt(c.substr(3,2),16);
  const b = parseInt(c.substr(4,2),16);
  const luma = ((r*299)+(g*587)+(b*114))/1000;

  if (luma < 100) {
    return '7289da';
  }
  else {
    return 'ffffff';
  }
}

function parseBlurple2 (c) {
  const r = parseInt(c.substr(1,2),16);
  const g = parseInt(c.substr(3,2),16);
  const b = parseInt(c.substr(4,2),16);
  if (r != 255 && g != 255 && b != 255) {
    return '7289da';
  }
  else {
    return c;
  }
}

const doEval = (message) => {

}
