#[derive(Debug)]
struct MyNumber{
    val:u32
}

impl From<u32> for MyNumber{
    fn from(e:u32)->Self{
        MyNumber { val: e }
    }
}
#[derive(Debug)]
struct PositiveNumber{
    value:u32
}
impl TryFrom<u32> for PositiveNumber{
    type Error=String;
    // fn try_from(value:u32)->Result<Self,Self::Error>{
    fn try_from(value:u32)->Result<Self,String>{
        if value>0{
            Ok(PositiveNumber{value})
            // Ok(Self{value})
        }else{
            Err("Negative numbers can't be converted".to_string())
        }
    }
}

// let a:u64=4;

#[derive(Debug)]
struct MyU32{
    value:u32
}
// impl TryFrom<u64> for u32{
impl TryFrom<u64> for MyU32{
    type Error=String;
    fn try_from(value:u64)->Result<Self,Self::Error>{
        if value<=u32::MAX as u64{
            // Ok(value as u32)
            Ok(MyU32{value:value as u32})
        }else{
            Err("This number can't be fit to u32".to_string())
        }
    }
}
pub fn From_and_Try_From(){
    let x=MyNumber::from(9);
    println!("{:?}",x);
    
    let y:MyNumber=(5 as u32).into();
    println!("{:?}",y);

    let z=PositiveNumber::try_from(10);
    println!("{:?}",z);
    
    let z1=PositiveNumber::try_from(0);
    println!("{:?}",z1);
    
    let z2:Result<MyU32,String>=(u64::MAX as u64).try_into();
    println!("{:?}",z2);
    
    let a:u16=(5 as u8).into();


    let e:&[u8]=&[1,2,3,4];
    let f:[u8;2]=e[0..2].try_into().unwrap();
    println!("{:?}",f);

}




// TL;DR
// Trait	    Direction	Return type	     Auto-impl relationship
// From<T>	    T → U	        U	          gives you Into<U> for T
// TryFrom<T>	T → U	    Result<U,E>	      gives you TryInto<U> for T