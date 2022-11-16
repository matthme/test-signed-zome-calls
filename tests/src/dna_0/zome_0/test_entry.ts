
import { DnaSource, Record, ActionHash } from "@holochain/client";
import { pause, runScenario } from "@holochain/tryorama";
import { decode } from '@msgpack/msgpack';
import pkg from 'tape-promise/tape';
const { test } = pkg;

import { dna0Dna } from  "../../utils";


export default () => test("test_entry CRUD tests", async (t) => {
  await runScenario(async scenario => {

    const dnas: DnaSource[] = [{path: dna0Dna }];

    const [alice, bob]  = await scenario.addPlayersWithHapps([dnas, dnas]);

    await scenario.shareAllAgents();

    const createInput = {
  "title": "the to us",
  "content": "Man creates Dinosaurs. They can trust me and go. No matter how you travel, it's still you going."
};

    // Alice creates a test_entry
    const createActionHash: ActionHash = await alice.cells[0].callZome({
      zome_name: "zome_0",
      fn_name: "create_test_entry",
      payload: createInput,
    });
    t.ok(createActionHash);

    // Wait for the created entry to be propagated to the other node.
    await pause(100);

    
    // Bob gets the created test_entry
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "zome_0",
      fn_name: "get_test_entry",
      payload: createActionHash,
    });
    t.deepEqual(createInput, decode((createReadOutput.entry as any).Present.entry) as any);
    
    
    // Alice updates the test_entry
    const contentUpdate = {
  "title": "a windows dependent",
  "content": "They're using our own satellites against us. always trying to save the planet? always trying to save the planet?"
}

    const updateInput = {
      original_action_hash: createActionHash,
      updated_test_entry: contentUpdate,
    };

    const updateActionHash: ActionHash = await alice.cells[0].callZome({
      zome_name: "zome_0",
      fn_name: "update_test_entry",
      payload: updateInput,
    });
    t.ok(updateActionHash); 

    // Wait for the updated entry to be propagated to the other node.
    await pause(100);

      
    // Bob gets the updated test_entry
    const readUpdatedOutput: Record = await bob.cells[0].callZome({
      zome_name: "zome_0",
      fn_name: "get_test_entry",
      payload: updateActionHash,
    });
    t.deepEqual(contentUpdate, decode((readUpdatedOutput.entry as any).Present.entry) as any); 

    
    
    // Alice deletes the test_entry
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "zome_0",
      fn_name: "delete_test_entry",
      payload: createActionHash,
    });
    t.ok(deleteActionHash); 

      
    // Wait for the deletion action to be propagated to the other node.
    await pause(100);

    // Bob tries to get the deleted test_entry, but he doesn't get it because it has been deleted
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "zome_0",
      fn_name: "get_test_entry",
      payload: createActionHash,
    });
    t.notOk(readDeletedOutput);

    
  });



});
