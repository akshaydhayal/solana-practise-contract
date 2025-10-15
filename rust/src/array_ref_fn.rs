use arrayref::{
    array_ref,
    array_refs,
    array_mut_ref,
    mut_array_refs
};
pub fn array_ref_fn(){
    println!("hello from second fn!!");    

    let mut a:[u8;4]=[1,2,3,4];
    println!("{:?}",a);

    let b=&a;
    println!("{:?}",b);
    
    let c=&a[1..4];
    println!("{:?}",c);
    
    let d=&b[1..4];
    println!("{:?}",d);

    let e1=array_ref![a,0,2];
    println!("{:?}",e1);
    // let e2=array_mut_ref![&mut a,0,2];
    // e2[0]=5;

    let mut f:[u8;34]=[5;34];
    let (g,h)=mut_array_refs![&mut f,32,2];

    let u16_bytes=u16::to_le_bytes(257 as u16);
    println!("{:?} first byte : {} second byte :{}",u16_bytes,u16_bytes[0],u16_bytes[1]);

    // h[0]=u16_bytes[0];
    // h[1]=u16_bytes[1];
    
    h.copy_from_slice(&257u16.to_le_bytes());
    let interpret_val=u16::from_le_bytes(*h);
    println!("interpret value from bytes : {}",interpret_val);

    let i:u64=10;
    let j=i.to_le_bytes();
    let k=&i.to_le_bytes()[..];
    println!("i : {}, j :{:?}, k:{:?}",i,j,k);

}