use hdi::prelude::*;





#[hdk_entry_helper]
#[derive(Clone)]
pub struct TestEntry {
  pub title: String,
  pub content: String,
}