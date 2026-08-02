import { test } from "node:test";
import assert from "node:assert/strict";

import { beginNewScreen } from "../begin-new-screen.js";
import { createMockCtx } from "../../routes/__tests__/helpers/mock-ctx.js";

test("beginNewScreen clears both screenMessageId and screenMessageKind together", () => {
  const { ctx } = createMockCtx({
    session: {
      ui: { screenMessageId: 321, screenMessageKind: "media" },
    },
  });

  beginNewScreen(ctx);

  assert.equal(ctx.session.ui.screenMessageId, undefined);
  assert.equal(ctx.session.ui.screenMessageKind, undefined);
});
