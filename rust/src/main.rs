//learnt about map, iter() , enumerate( and sum()
//map and sum works on iter() methods only and collect collects all iter and create a new 
//colelction and hence need types


pub mod array_ref_fn;
pub mod try_from;
pub mod iter_map_enumerate;
pub mod round_maths;
pub mod accounts_pack;
use crate::array_ref_fn::array_ref_fn;
use crate::try_from::From_and_Try_From;
use crate::iter_map_enumerate::iter_map_enumerate_sum;
use crate::round_maths::round_maths;

fn main() {
    println!("Hello, world!");    
    // iter_map_enumerate_sum();
    // From_and_Try_From;
    // round_maths();
    
    array_ref_fn();
}