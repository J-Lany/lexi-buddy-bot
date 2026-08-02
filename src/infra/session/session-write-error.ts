/**
 * Marks a failure in the session *persistence* step (grammY's
 * PropertySession.finish(), which calls storage.write()/storage.delete()
 * strictly after the handler has already run and replied). Kept as a
 * distinct type — not a message string — so the error boundary can tell
 * "the handler never got to run" apart from "the handler succeeded but the
 * session couldn't be saved" without any text matching.
 */
export class SessionWriteError extends Error {
  constructor(cause: unknown) {
    super("Session persistence failed after the update was already handled", {
      cause,
    });
    this.name = "SessionWriteError";
  }
}
