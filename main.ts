import { Args, ArgumentMissingError, InvalidArgumentError, UnexpectedArgumentError, parseArgs } from "./args.ts";

let args: Args;
try {
  args = parseArgs(Deno.args);
} catch (e) {
  const COLOR_INHERIT = "color: inherit";
  const COLOR_RED = "color: #FF4444";
  const COLOR_GREEN = "color: #00FFAA";

  handle: {
    if (e instanceof ArgumentMissingError) {
      console.log(`%cerror%c: following argument was not provided: ${e.name}`, COLOR_RED, COLOR_INHERIT);
      console.log();
      console.log(`%cusage%c: ${e.usage}`, COLOR_GREEN, COLOR_INHERIT);
      console.log();
      break handle;
    }

    if (e instanceof InvalidArgumentError) {
      console.log(`%cerror%c: ${e.message}`, COLOR_RED, COLOR_INHERIT);
      console.log();
      console.log(`%cusage%c: ${e.usage}`, COLOR_GREEN, COLOR_INHERIT);
      console.log();
      break handle;
    }

    if (e instanceof UnexpectedArgumentError) {
      console.log(`%cerror%c: unexpected arguments: ${e.unexpected}`, COLOR_RED, COLOR_INHERIT);
      console.log();
      console.log(`%cusage%c: ${e.usage}`, COLOR_GREEN, COLOR_INHERIT);
      console.log();
      break handle;
    }

    console.log(`Unexpected Error: `, e);
  }

  Deno.exit();
}

console.log(args);


const worker = new Worker(new URL("./aaa.ts", import.meta.url), {
  type: "module",
  deno: {
    permissions: {
      net: [],
      run: ["./lib/*"]
    }
  }
});

