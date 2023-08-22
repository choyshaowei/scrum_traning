const { Worker, isMainThread } = require("worker_threads");
const readline = require("readline-sync");
const gameController = require("./GameController/gameController.js");
const cliColor = require("cli-color");
const beep = require("beepbeep");
const position = require("./GameController/position.js");
const letters = require("./GameController/letters.js");
const { parse } = require("path");
let telemetryWorker;

class Battleship {
  start() {
    telemetryWorker = new Worker("./TelemetryClient/telemetryClient.js");

    console.log("Starting...");
    telemetryWorker.postMessage({
      eventName: "ApplicationStarted",
      properties: { Technology: "Node.js" },
    });

    console.log(cliColor.magenta("                                     |__"));
    console.log(cliColor.magenta("                                     |\\/"));
    console.log(cliColor.magenta("                                     ---"));
    console.log(cliColor.magenta("                                     / | ["));
    console.log(cliColor.magenta("                              !      | |||"));
    console.log(
      cliColor.magenta("                            _/|     _/|-++'")
    );
    console.log(
      cliColor.magenta("                        +  +--|    |--|--|_ |-")
    );
    console.log(
      cliColor.magenta("                     { /|__|  |/\\__|  |--- |||__/")
    );
    console.log(
      cliColor.magenta(
        "                    +---------------___[}-_===_.'____                 /\\"
      )
    );
    console.log(
      cliColor.magenta(
        "                ____`-' ||___-{]_| _[}-  |     |_[___\\==--            \\/   _"
      )
    );
    console.log(
      cliColor.magenta(
        " __..._____--==/___]_|__|_____________________________[___\\==--____,------' .7"
      )
    );
    console.log(
      cliColor.magenta(
        "|                        Welcome to Battleship                         BB-61/"
      )
    );
    console.log(
      cliColor.magenta(
        " \\_________________________________________________________________________|"
      )
    );
    console.log();

    this.InitializeGame();
    this.StartGame();
  }

  NextPosition(key) {
    const letters = "ABCDEFGH";
    const maxNumber = 8;

    const letter = key.charAt(0);
    const number = parseInt(key.substring(1));

    // If the number is less than 10, suggest the next number in the same row
    if (number < maxNumber) {
      return letter + (number + 1);
    } else {
      // If we are at the end of a row, suggest the first number in the next row
      const letterIndex = letters.indexOf(letter);

      // If the letter is not 'H', suggest the next letter
      if (letterIndex < letters.length - 1) {
        const nextLetter = letters.charAt(letterIndex + 1);
        return nextLetter + "1";
      }
      // If we are at the last position 'H8', loop back to 'A1'
      else {
        return "A1";
      }
    }
  }

  StartGame() {
    console.clear();
    console.log(cliColor.blueBright("                  __"));
    console.log(cliColor.blueBright("                 /  \\"));
    console.log(cliColor.blueBright("           .-.  |    |"));
    console.log(cliColor.blueBright("   *    _.-'  \\  \\__/"));
    console.log(cliColor.blueBright("    \\.-'       \\"));
    console.log(cliColor.blueBright("   /          _/"));
    console.log(cliColor.blueBright("  |      _  /"));
    console.log(cliColor.blueBright("  |     /_\\'"));
    console.log(cliColor.blueBright("   \\    \\_/"));
    console.log(cliColor.blueBright('    """"'));

    do {
      console.log();
      console.log(cliColor.cyanBright("Player, it's your turn"));
      console.log(cliColor.cyanBright("Enter coordinates for your shot :"));
      var position = Battleship.ParsePosition(readline.question());
      var isHit = gameController.CheckIsHit(this.enemyFleet, position);

      telemetryWorker.postMessage({
        eventName: "Player_ShootPosition",
        properties: { Position: position.toString(), IsHit: isHit },
      });

      if (isHit) {
        beep();
        console.log();
        console.log(
          cliColor.greenBright("------------------------------------------")
        );
        console.log(cliColor.yellow("                \\         .  ./"));
        console.log(cliColor.yellow('              \\      .:";\'.:.."   /'));
        console.log(cliColor.yellow("                  (M^^.^~~:.'\")."));
        console.log(cliColor.yellow("            -   (/  .    . . \\ \\)  -"));
        console.log(cliColor.yellow("               ((| :. ~ ^  :. .|))"));
        console.log(cliColor.yellow("            -   (\\- |  \\ /  |  /)  -"));
        console.log(cliColor.yellow("                 -\\  \\     /  /-"));
        console.log(cliColor.yellow("                   \\  \\   /  /"));
        console.log(
          cliColor.greenBright("------------------------------------------")
        );
      }

      console.log(
        isHit
          ? cliColor.green("Yeah ! Nice hit !", "Possible next move: ") +
              cliColor.bold(this.NextPosition(position.toString()))
          : cliColor.yellow("Miss")
      );
      console.log(
        cliColor.greenBright("------------------------------------------")
      );
      console.log();

      var computerPos = this.GetRandomPosition();
      var isHit = gameController.CheckIsHit(this.myFleet, computerPos);

      telemetryWorker.postMessage({
        eventName: "Computer_ShootPosition",
        properties: { Position: computerPos.toString(), IsHit: isHit },
      });

      console.log(
        cliColor.bgGreenBright("------------------------------------------")
      );
      console.log();
      console.log(
        `Computer shot in ${computerPos.column}${computerPos.row} and ` +
          (isHit ? cliColor.red(`has hit your ship !`) : cliColor.bold(`miss`))
      );
      if (isHit) {
        beep();
        console.log();
        console.log(
          cliColor.greenBright("------------------------------------------")
        );
        console.log(cliColor.yellow("                \\         .  ./"));
        console.log(cliColor.yellow('              \\      .:";\'.:.."   /'));
        console.log(cliColor.yellow("                  (M^^.^~~:.'\")."));
        console.log(cliColor.yellow("            -   (/  .    . . \\ \\)  -"));
        console.log(cliColor.yellow("               ((| :. ~ ^  :. .|))"));
        console.log(cliColor.yellow("            -   (\\- |  \\ /  |  /)  -"));
        console.log(cliColor.yellow("                 -\\  \\     /  /-"));
        console.log(cliColor.yellow("                   \\  \\   /  /"));
        console.log(
          cliColor.greenBright("------------------------------------------")
        );
      }
      console.log();
      console.log(
        cliColor.bgGreenBright("------------------------------------------")
      );
    } while (true);
  }

  static ParsePosition(input) {
    var letter = letters.get(input.toUpperCase().substring(0, 1));
    var number = parseInt(input.substring(1, 2), 10);
    return new position(letter, number);
  }

  GetRandomPosition() {
    var rows = 8;
    var lines = 8;
    var rndColumn = Math.floor(Math.random() * lines);
    var letter = letters.get(rndColumn + 1);
    var number = Math.floor(Math.random() * rows);
    var result = new position(letter, number);
    return result;
  }

  InitializeGame() {
    this.InitializeMyFleet();
    this.InitializeEnemyFleet();
  }

  InitializeMyFleet() {
    this.myFleet = gameController.InitializeShips();

    console.log(
      cliColor.blue(
        "Please position your fleet (Game board size is from A to H and 1 to 8) :"
      )
    );

    this.myFleet.forEach(function (ship) {
      console.log();
      console.log(
        cliColor.blue(
          `Please enter the positions for the ${ship.name} (size: ${ship.size})`
        )
      );
      for (var i = 1; i < ship.size + 1; i++) {
        console.log(cliColor.cyanBright(`Enter position ${i} of ${ship.size} (i.e A3):`));
        const position = readline.question();
        telemetryWorker.postMessage({
          eventName: "Player_PlaceShipPosition",
          properties: {
            Position: position,
            Ship: ship.name,
            PositionInShip: i,
          },
        });
        ship.addPosition(Battleship.ParsePosition(position));
      }
    });
  }

  InitializeEnemyFleet() {
    this.enemyFleet = gameController.InitializeShips();

    this.enemyFleet[0].addPosition(new position(letters.B, 4));
    this.enemyFleet[0].addPosition(new position(letters.B, 5));
    this.enemyFleet[0].addPosition(new position(letters.B, 6));
    this.enemyFleet[0].addPosition(new position(letters.B, 7));
    this.enemyFleet[0].addPosition(new position(letters.B, 8));

    this.enemyFleet[1].addPosition(new position(letters.E, 6));
    this.enemyFleet[1].addPosition(new position(letters.E, 7));
    this.enemyFleet[1].addPosition(new position(letters.E, 8));
    this.enemyFleet[1].addPosition(new position(letters.E, 9));

    this.enemyFleet[2].addPosition(new position(letters.A, 3));
    this.enemyFleet[2].addPosition(new position(letters.B, 3));
    this.enemyFleet[2].addPosition(new position(letters.C, 3));

    this.enemyFleet[3].addPosition(new position(letters.F, 8));
    this.enemyFleet[3].addPosition(new position(letters.G, 8));
    this.enemyFleet[3].addPosition(new position(letters.H, 8));

    this.enemyFleet[4].addPosition(new position(letters.C, 5));
    this.enemyFleet[4].addPosition(new position(letters.C, 6));
  }
}

module.exports = Battleship;
