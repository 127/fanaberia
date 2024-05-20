import { defineConfig } from "cypress";
import { prisma } from "./app/services/db.server";
import { Prisma } from "@prisma/client";
import { init } from "smtp-tester";
// import { exec } from "node:child_process";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on) {
      // starts the SMTP server at localhost:7777
      const port = 7777;
      const mailServer = init(port);
      console.log("mail server at port %d", port);

      // [receiver email]: email text
      let lastEmail = {};

      // process all emails
      mailServer.bind((addr, id, email) => {
        console.log("--- email to %s ---", email.headers.to);
        console.log(email.body);
        console.log("--- end ---");
        // store the email by the receiver email
        lastEmail[email.headers.to as string] = {
          body: email.body,
          html: email.html,
        };
      });

      //, config
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        async query(sql) {
          return await prisma.$queryRaw(Prisma.raw(sql));
        },
        resetEmails(email) {
          console.log("reset all emails");
          if (email) {
            delete lastEmail[email];
          } else {
            lastEmail = {};
          }
          return null;
        },
        getLastEmail(userEmail) {
          // cy.task cannot return undefined
          // thus we return null as a fallback
          return lastEmail[userEmail] || null;
        },
        // startMailServer() {
        //   return new Promise((resolve, reject) => {
        //     const process = exec(
        //       "tsx ./cypress/test-mail-server.ts",
        //       (error, stdout, stderr) => {
        //         if (error) {
        //           reject(error);
        //         }
        //         console.log(stdout);
        //         console.error(stderr);
        //         resolve(stdout);
        //       }
        //     );

        //     process.on("exit", (code) => {
        //       console.log(`Child process exited with code ${code}`);
        //     });
        //   });
        // },
      });
    },
  },
});

// component: {
//   devServer: {
//     framework: "react",
//     bundler: "vite",
//   },
// },
