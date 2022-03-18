const express = require("express");
const bodyParser = require("body-parser");
const luxon = require("luxon");
const axios = require("axios");
const app = express();
const port = 7777;
const token = "{Any token you want to valid}";
const discord_webhookUrl = "{Discord Webhook Url}";
const timeZone = "{Any Zone as Asia/Shanghai}";

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("App Alive!");
});

app.post("/pr", (req, res) => {
  const time = luxon.DateTime.now()
    .setZone(timeZone)
    .toFormat("yyyy/MM/dd HH:mm:ss");

  console.log(`${time} - Get Integration!`);

  if (req.headers["x-gitlab-token"] !== token) {
    console.log(`${time} - Not Validate!`);
    return res.status(404);
  }

  const state = req.body.object_attributes.state;
  const state_list = ["opened", "update"];

  console.log(`${time} - From Type ${state}`);

  if (state_list.includes(state)) {
    const author = req.body.user.name;
    const email = req.body.user.email;
    const title = req.body.object_attributes.title;
    const description = req.body.object_attributes.description
      ? req.body.object_attributes.description
      : "-";
    const source_branch = req.body.object_attributes.source_branch;
    const url = req.body.object_attributes.url;
    const create_time = luxon.DateTime.fromISO(
      req.body.object_attributes.created_at
    )
      .setZone(timeZone)
      .toFormat("yyyy/MM/dd HH:mm:ss");

    const json = {
      content: `👻 New PR: ${author}'s Effort`,
      embeds: [
        {
          title: "Pull Request Notification",
          fields: [
            {
              name: "Author",
              value: `${author} (${email})`,
            },
            {
              name: "Title",
              value: title,
            },
            {
              name: "Description",
              value: description,
            },
            {
              name: "Source Branch",
              value: source_branch,
            },
            {
              name: "URL",
              value: url,
            },
            {
              name: "Create Time",
              value: create_time,
            },
          ],
        },
      ],
    };

    console.log(`${time} - Data ${JSON.stringify(json)}`);

    axios.post(discord_webhookUrl, json).catch((error) => {
      console.log(`${time} - Error ${error}`);
    });
  }

  res.send("Success!");
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
