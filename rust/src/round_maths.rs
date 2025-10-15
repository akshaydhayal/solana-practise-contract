pub fn round_maths(){
    println!("round maths");
     //rounding f64
    let g:u64=10;
    let h:u64=6;
    let i=((g*h) as f64).sqrt().floor();
    let j=((g*h) as f64).sqrt();
    let k=((g*h) as f64).sqrt() as u64;
    println!(" i : {} j: {} k: {}",i,j,k);

    let a:u64=5;
    let b:u64=10;
    let c:u64=10;
    let ans=a/b*c;    //ans is 0 and no 5 as ans=5/10*10, first 5/10 is caluclated whoch is 0 and 0*10=0
    println!("ans : {}",ans);

    let ans2=(a as u128) * (c as u128)/ (b as u128);    //ans is 0 and no 5 as ans=5/10*10, first 5/10 is caluclated whoch is 0 and 0*10=0
    println!("ans : {}",ans2);

    let d=10f64;
}