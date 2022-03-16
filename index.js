const express = require("express");
const bodyParser = require("body-parser");
const luxon = require("luxon");
const axios = require("axios");
const app = express();
const port = 7777;

const token = "{Any token you want to valid}";
const discord_webhookUrl = "{Discord Webhook Url}";

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("App Alive!");
});

app.post("/pr", (req, res) => {
  // check token is equals
  if (req.headers["x-gitlab-token"] !== token) {
    return res.status(404);
  }

  const state = req.body.object_attributes.state;

  // only capture pull request open or update
  const state_list = ["open", "update"];

  if (state_list.includes(state)) {
    const author = req.body.user.name;
    const email = req.body.user.email;
    const title = req.body.object_attributes.title;
    const description = req.body.object_attributes.description;
    const source_branch = req.body.object_attributes.source_branch;
    const url = req.body.object_attributes.url;
    const create_time = luxon.DateTime.fromISO(
      req.body.object_attributes.created_at
    )
      // set your area zone
      .setZone("Asia/Shanghai")
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

    axios.post(discord_webhookUrl, json);
  }

  res.send("Success!");
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
