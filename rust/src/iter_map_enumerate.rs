pub fn iter_map_enumerate_sum() {
    println!("Try programiz.pro");
    let x=vec![1,2,3,4];
    let double_x:Vec<u32>=x.iter().map(|o| o*2).collect();
    let sum=x.iter().sum::<u32>();

    println!("{}",sum);
    println!("{:?}",x);
    println!("{:?}",double_x);
    
    let names=vec!["a","bb","ccc","dddd"];
    let names2:Vec<String>=names.iter().map(|o| o.to_uppercase()).collect();
    println!("{:?}",names2);
    
    let names3:Vec<String>=names.iter()
    .enumerate()
    .map(|(ind,item)| format!("{} {}",ind,item)).collect();
    println!("{:?}",names3);   



    //Maps, filter, enumerate
    let a:Vec<i32>=vec![1,2,3,4];
    println!("{:?}",a);

    //map with enumerate
    let b:Vec<i32>=a.iter()
    .enumerate()
    .map(|(ind,item)| ind as i32+item).collect();
    println!("{:?}",b);
    
    //filter
    let c:Vec<i32>=a.iter().filter(|i| **i>=3 ).cloned().collect();
    println!("{:?}",c);
    
    //combing map and filter
    let d:Vec<i32>=a.iter()
    .filter(|i| **i>=3)
    .map(|i| i*2).collect();
    println!("{:?}",d);
}
