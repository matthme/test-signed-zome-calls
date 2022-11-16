use hdk::prelude::*;
use zome_0_integrity::TestEntry;
use zome_0_integrity::EntryTypes;

#[hdk_extern]
pub fn get_test_entry(action_hash: ActionHash) -> ExternResult<Option<Record>> {
  get(action_hash, GetOptions::default())
}


#[hdk_extern]
pub fn create_test_entry(test_entry: TestEntry) -> ExternResult<ActionHash> {
  create_entry(&EntryTypes::TestEntry(test_entry.clone()))
}


#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateTestEntryInput {
  original_action_hash: ActionHash,
  updated_test_entry: TestEntry
}

#[hdk_extern]
pub fn update_test_entry(input: UpdateTestEntryInput) -> ExternResult<ActionHash> {
  update_entry(input.original_action_hash, &input.updated_test_entry)
}


#[hdk_extern]
pub fn delete_test_entry(action_hash: ActionHash) -> ExternResult<ActionHash> {
  delete_entry(action_hash)
}

