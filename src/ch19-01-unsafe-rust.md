## 不安全的Rust

在本书之前的章节, 我们讨论了Rust代码在编译时会强制保证内存安全. 然而, Rust还有另一个隐藏的语言特性, 这就是不安全的Rust, 它不会担保内存安全. 不安全的Rust和常规Rust代码无异, 但是它会给你安全的Rust代码不具备的超能力.

不安全的Rust之所以存在, 本质上是因为编译器对代码的静态分析趋于保守. 代码何时保证内存安全, 何时放权这种担保呢? 把合法的代码拒绝掉通常比接纳非法的代码要好一点. 有些时候你的代码的确没问题, 但是Rust却不这样认为! 这时你可以用不安全的代码告诉编译器, "相信我吧, 我知道我在做什么." 这样缺陷可能就在于你自己了; 如果你的不安全代码发生了错误, 比如对null指针解引用就可能会引发内存出错的大问题.

还有另一个Rust需要不安全代码的原因: 底层电脑硬件固有的不安全性. 如果Rust不让你执行不安全的操作, 那么有些任务你就完成不了. 但是Rust需要你能够做像直接与操作系统交互甚至是写你自己的操作系统这样的底层操作! 这也是Rust语言的一部分目标, 所以我们需要一些来做这些事情的方法.

### 不安全的神力

我们通过使用`unsafe`关键字开启一个持有不安全代码的代码块来切换到不安全的Rust. 你可以在不安全的Rust中进行四个安全的Rust做不到的操作. 我们把它们称作"不安全的神力". 之前我们没见过这几个特性是因为它们只用在`unsafe`代码块中! 它们是: 

1. 解引用原生指针
2. 调用一个不安全的函数或方法
3. 访问或修改一个不可变的静态变量
4. 实现一个不安全的trait

记住这一点很重要, `unsafe`不会关掉借用检查器也不会禁用其它的Rust安全性检查: 如果你在不安全的代码中用了引用, 它仍将会被检查. `unsafe`关键字做的唯一的一件事是让你存取编译器因内存安全性而没去检查的上述四个特性.在一个unsafe代码块中你仍然会获得某种程度的安全性! 此外, `unsafe`并不是说代码块中的代码是危险的或者有内存安全性问题: 它只是表明作为程序员的你关掉了编译器检查, 你将确保`unsafe`代码块会拥有合理的内存.

人是会犯错误的, 错误总会发生. 在`unsafe`代码块中执行上述四个不安全的操作时, 如果你犯了错误并得到一个内存安全性的错误, 你必定会知道它与你使用不安全的代码有关. 这样就更容易处理内存安全性的bug, 因为Rust已经帮我们把其它的代码做了检查. 能缩小排查内存安全性bug的出现区域当然好, 所以尽量缩小你的不安全代码的数量吧. 当修正内存安全问题时, `unsafe`代码块中的任何代码都可能出错: 所以让`unsafe`代码块尽可能的小吧, 以后你需要排查的代码也会少一些.

为了尽可能隔离不安全的代码, 在安全的抽象中包含不安全的代码并提供一个安全的API是一个好主意, 当我们学习不安全的函数和方法时我们会讨论它. 标准库中有些不安全的代码被实现为安全的抽象, 它们中的部分已被审核过了. 当你或者你的用户使用通过`unsafe`代码实现的功能时, 因为使用一个安全的抽象是安全的, 这样就可以避免到处都是`unsafe`字样.

让我们按顺序依次介绍上述四个不安全的神力, 同时我们会见到一些抽象, 它们为不安全的代码提供了安全的接口.

### 解引用原生指针

回到第4章, 我们在哪里学习了引用. 我们知道编译器会确保引用永远合法. 不安全的Rust有两个类似于引用的被称为*原生指针*(*raw pointers*)的新类型. 和引用一样, 我们可以有一个不可变的原生指针和一个可变的原生指针. 在原生指针的上下文中, "不可变"意味着指针不能直接被解引用和被赋值. 例19-1演示了如何通过引用来创建一个原生指针:

```rust
let mut num = 5;

let r1 = &num as *const i32;
let r2 = &mut num as *mut i32;
```

<span class="caption">例19-1: 通过引用创建原生指针</span>

上例中`*const T`类型是一个不可变的原生指针, `*mut T`是一个可变的原生指针. 我们通过使用`as`把一个可变的和一个不可变的引用转换成它们对应的原生指针类型来创建原生指针. 与引用不同, 这些指针的合法性不能得到保证.

例19-2演示了如何创建一个指向内存中任意地址的原生指针. 试图随便访问内存地址所带来的结果是难以预测的: 也许在那个地址处有数据, 也许在那个地址处没有任何数据, 编译器也可能会优化代码导致那块内存不能访问, 亦或你的程序可能会发生段错误. 虽然可以写出下面的代码, 但是通常找不到好的理由来这样做:

```rust
let address = 0x012345;
let r = address as *const i32;
```

<span class="caption">例子19-2: 创建一个指向任意内存地址的原生指针</span>

注意在例19-1和19-2中没有`unsafe`代码块. 你可以在安全代码中*创建*原生指针
raw pointers in safe code, 但是你不能在安全代码中*解引用*(*dereference*)原生指针来读取被指针指向的数据. 如例19-3所示, 对原生指针解引用需要在`unsafe`代码块中使用解引用操作符`*`:

```rust
let mut num = 5;

let r1 = &num as *const i32;
let r2 = &mut num as *mut i32;

unsafe {
    println!("r1 is: {}", *r1);
    println!("r2 is: {}", *r2);
}
```

<span class="caption">例19-3: 在`unsafe`代码块中解引用原生指针</span>

创建一个指针不会造成任何危险; 只有在你访问指针指向的值时可能出问题, 因为你可能会用它处理无效的值.

注意在19-1和19-3中我们创建的一个`*const i32`和一个`*mut i32`都指向同一个内存位置, 也就是`num`. 如果我们尝试创建一个不可变的和可变的`num`的引用而不是原生指针, 这就不能被编译, 因为我们不能在使用了不可变引用的同时再对同一个值进行可变引用. 通过原生指针, 我们能创建指向同一个内存位置的可变指针和不可变指针, 我们可以通过可变指针来改变数据, 但是要小心, 因为这可能会产生数据竞争!

既然存在这么多的危险, 为什么我们还要使用原生指针呢? 一个主要的原因是为了与C代码交互, 在下一节的不安全函数里我们将会看到. 另一个原因是创建一个借用检查器理解不了的安全的抽象. 下面让我们介绍不安全的函数, 然后再看一个使用了不安全代码的安全的抽象的例子.

### 调用一个不安全的函数或方法

需要一个不安全的代码块的才能执行的第二个操作是调用不安全的函数. 不安全的函数和方法与常规的函数和方法看上去没有什么异样, 只是他们前面有一个额外的`unsafe`关键字. 不安全的函数的函数体自然是`unsafe`的代码块. 下例是一个名叫`dangerous`的不安全的函数:

```rust
unsafe fn dangerous() {}

unsafe {
    dangerous();
}
```

如果不用`unsafe`代码块来调用`dangerous`, 我们将会得到下面的错误:

```text
error[E0133]: call to unsafe function requires unsafe function or block
 --> <anon>:4:5
  |
4 |     dangerous();
  |     ^^^^^^^^^^^ call to unsafe function
```

通过把对`dangerous`的调用放到`unsafe`代码块中, 我们表明我们已经阅读了该函数的文档, 我们明白如何正确的使用它, 并且我们已经验证了调用的正确性.

#### 创建一个不安全的代码上的安全的抽象

让我们用标准库中的某个函数比如`split_at_mut`来举个例子, 然后来探讨我们如何自己来实现它. 这个方法被定义在一个可变的切片(slice)上, 它通过参数指定的索引把一个切片分割成两个, 如例19-4所示:

```rust
let mut v = vec![1, 2, 3, 4, 5, 6];

let r = &mut v[..];

let (a, b) = r.split_at_mut(3);

assert_eq!(a, &mut [1, 2, 3]);
assert_eq!(b, &mut [4, 5, 6]);
```

<span class="caption">例19-4: 使用安全的`split_at_mut`函数</span>

用安全的Rust代码是不能实现这个函数的. 如果要试一下用安全的Rust来实现它可以参考例19-5. 简单起见, 我们把`split_at_mut`实现成一个函数而不是一个方法, 这个函数只处理`i32`类型的切片而不是泛型类型`T`的切片:

```rust,ignore
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();

    assert!(mid <= len);

    (&mut slice[..mid],
     &mut slice[mid..])
}
```

<span class="caption">例19-5: 尝试用安全的Rust来实现`split_at_mut`</span>

该函数先取得切片(slice)的长度, 然后通过检查参数是否小于或等于这个长度来断言参数给定的索引位于切片(slice)当中. 这个断言意外着如果我们传入的索引比要分割的切片(slice)的长度大, 这个函数就会在使用这个索引前中断(panic).

接着我们在一个元组中返回两个可变的切片(slice): 一个从被分割的切片的头部开始直到`mid`索引的前一个元素中止, 另一个从被分割的切片的`mid`索引开始直到被分割的切片的末尾结束.

如果我们编译上面的代码, 我们将得到一个错误:

```text
error[E0499]: cannot borrow `*slice` as mutable more than once at a time
 --> <anon>:6:11
  |
5 |     (&mut slice[..mid],
  |           ----- first mutable borrow occurs here
6 |      &mut slice[mid..])
  |           ^^^^^ second mutable borrow occurs here
7 | }
  | - first borrow ends here
```

Rust的借用检查器不能理解为什么我们要借用这个切片(slice)的不同部分; 它只知道我们对同一个切片借用了两次. 借用一个切片(slice)的不同部分在功能上是没问题的; 而且我们的两个`&mut [i32]`也没有重叠. 但是Rust并没有聪明到能明白这一点. 当我们知道有些东西是可以的但是Rust却不知道的时候就是时候使用不安全的代码了.

例子19-6演示了如何用一个`unsafe`代码块、 一个原生指针和一个不安全的函数调用来实现`split_at_mut`:

```rust
use std::slice;

fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();
    let ptr = slice.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (slice::from_raw_parts_mut(ptr, mid),
         slice::from_raw_parts_mut(ptr.offset(mid as isize), len - mid))
    }
}
```

<span class="caption">例19-6: 用不安全的代码来实现`split_at_mut`</span>

回顾一下第4章, 切片(slice)是一个指向某个数据的指针和这个切片(slice)的长度. 我们经常用`len`方法来取得切片的长度; 也可以用`as_mut_ptr`方法来访问切片的原生指针. 在这个例子里, 因为我们有一个可变的`i32`类型的切片, `as_mut_ptr`返回一个`*mut i32`类型的原生指针, 我们把它存放在变量`ptr`里.

对索引`mid`合法性的断言上面已经介绍过了. 函数`slice::from_raw_parts_mut`的行为与`as_mut_ptr`和`len`方法相反: 它以一个原生指针和一个长度为参数并返回一个切片(slice). 我们调用`slice::from_raw_parts_mut`来创建一个从`ptr`开始且拥有`mid`个元素的切片. 然后我们以`mid`为参数调用`prt`上的`offset`方法来得到一个从索引`mid`开始的原生指针, 然后我们用这个原生指针和索引`mid`之后的元素个数为参数创建一个切片.

因为切片(slice)会被检查, 所以一旦我们创建了它就可以安全使用. 函数`slice::from_raw_parts_mut`是一个不安全的函数因为它有一个原生指针参数, 而且它相信这个指针是有效的. 原生指针的`offset`方法也是不安全的, 因为它相信一个原生指针的位置偏移一些后也是一个有效的指针. 为了能调用`slice::from_raw_parts_mut`和`offset`, 我们把他们的调用放到一个`unsafe`代码块中, 我们可以通过查看代码并添加`mid`不大于`len`的断言来表明`unsafe`代码块中的原生指针是指向切片中的数据的有效指针. 这是一个`unsafe`恰当用法.

注意结果`split_at_mut`函数是安全的: 我们不用在它的前面添加`unsafe`关键字, 并且我们可以从安全的Rust代码中调用它. 我们通过写一个使用了`unsafe`代码的函数来创建不安全代码的安全抽象, 上例用一种安全的方式通过函数访问的数据来创建有效的指针.

相反, 当使用切片(slice)时, 例19-7中`slice::from_raw_parts_mut`的用法很可能会崩溃. 下面的代码用一个随意的内存地址来创建一个有10000个元素的切片:

```rust
use std::slice;

let address = 0x012345;
let r = address as *mut i32;

let slice = unsafe {
    slice::from_raw_parts_mut(r, 10000)
};
```

<span class="caption">例19-7: 通过一个任意的内存位置来创建一个切片</span>

我们不能拥有任意地址的内存, 也不能保证这个代码创建的切片会包含有效的`i32`类型的值. 试图使用臆测是有效切片的`slice`的行为是难以预测的.

#### 调用外部代码的`extern`函数是不安全的

有时, 你的Rust代码需要与其它语言交互. Rust有一个`extern`关键字可以实现这个功能, 这有助于创建并使用*外部功能接口(Foreign Function Interface)* (FFI). 例19-8演示了如何与定义在一个非Rust语言编写的外部库中的`some_function`进行交互. 在Rust中调用`extern`声明的代码块永远都是不安全的:

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
extern "C" {
    fn some_function();
}

fn main() {
    unsafe { some_function() };
}
```

<span class="caption">例19-8: 声明并调用一个用其它语言写成的函数</span>

在`extern "C"`代码块中, 我们列出了我们想调用的用其它语言实现的库中定义的函数名和这个函数的特征签名.`"C"`定义了外部函数使用了哪种*应用程序接口(application binary interface)* (ABI). ABI定义了如何在汇编层调研这个函数. `"C"`是最常用的遵循C语言的ABI.

调用一个外部函数总是不安全的. 如果我们要调用其他语言, 这种语言却不会遵循Rust的安全保证. 因为Rust不能检查外部代码是否是安全的, 我们只负责检查外部代码的安全性来表明我们已经用`unsafe`代码块来调用外部函数了.

<!-- PROD: START BOX -->

##### 通过其它语言来调用Rust函数

`extern`关键字也总是被用来创建一个允许被其他语言调用的Rust函数. 与`extern`代码块不同, 我们可以在`fn`关键字之前添加`extern`关键字并指定要使用的ABI. 我们也加入注解`#[no_mangle]`来告诉Rust编译器不要取消这个函数的名字. 一旦我们把下例的代码编译成一个共享库并链接到C, 这个`call_from_c`函数就可以被C代码访问了:

```rust
#[no_mangle]
pub extern "C" fn call_from_c() {
    println!("Just called a Rust function from C!");
}
```

上例的`extern`不需要`unsafe`就可以直接用

<!-- PROD: END BOX -->

### 访问或修改一个可变的静态变量

目前为止本书还没有*讨论全局变量(global variables)*. 很多语言都支持全局变量, 当然Rust也不例外. 然而全局变量也有问题: 比如, 如果两个线程访问同一个可变的全局变量有可能会发生数据竞争.

全局变量在Rust中被称为是*静态(static)*变量. 例19-9中声明并使用了一个字符串切片类型的静态变量:

<span class="filename">Filename: src/main.rs</span>

```rust
static HELLO_WORLD: &str = "Hello, world!";

fn main() {
    println!("name is: {}", HELLO_WORLD);
}
```

<span class="caption">例19-9: 定义和使用一个不可变的静态变量</span>

`static`变量类似于常量: 按照惯例它们的命名遵从`SCREAMING_SNAKE_CASE(用下划线分割的全大写字母)`风格, 我们也*必须*注明变量的类型, 本例中是`&'static str`. 只有定义为`'static`的生命期才可以被存储在一个静态变量中. 也正因为此, Rust编译器自己就已经很清楚静态变量的生命期了, 所以我们也不需要明确地注明它了. 访问不可变的静态变量是安全的. 因为静态变量的值有一个固定的内存地址, 所以使用该值的时候总会得到同样的数据. 另一方面, 当常量被使用时, 复制它们的数据也是被允许的.

静态变量与常量的另一个不同是静态变量可以是可变的. 访问和修改可变的静态变量都是不安全的. 例19-10演示了如何声明、访问和修改一个名叫`COUNTER`的可变的静态变量:

<span class="filename">Filename: src/main.rs</span>

```rust
static mut COUNTER: u32 = 0;

fn add_to_count(inc: u32) {
    unsafe {
        COUNTER += inc;
    }
}

fn main() {
    add_to_count(3);

    unsafe {
        println!("COUNTER: {}", COUNTER);
    }
}
```

<span class="caption">例19-10: 读取或修改一个可变的静态变量是不安全的</span>

与常规变量一样, 我们用`mut`关键字来表明这个静态变量是可变的. 每次我们对`COUNTER`的读写都必须被放到一个`unsafe`代码块中. 上面的代码编译运行会打印`COUNTER: 3`, 这正如我们期望的那样, 因为程序现在是一个单线程, 如果有多个线程访问`COUNTER`就可能会导致数据竞争.

可全局访问的可变数据难于管理也很难保证没有数据竞争, 这也正是Rust认为可变的静态变量是不安全的原因. 如果可能, 请使用在第16章中介绍的并发技术和线程安全的智能指针, 这样可以让编译器从不同的线程检查被访问的数据是安全的.

### 实现一个不安全的Trait

最后, 当我们使用`unsafe`关键字时最后一个只在不安全的代码中才能做的事是实现一个不安全的trait. 我们可以在`trait`之前添加一个`unsafe`关键字来声明一个trait是不安全的, 以后实现这个trait的时候也必须标记一个`unsafe`关键字, 如19-11所示:

```rust
unsafe trait Foo {
    // methods go here
}

unsafe impl Foo for i32 {
    // method implementations go here
}
```

<span class="caption">例19-11: 定义并实现一个不安全的trait</span>

与不安全的函数类似, 一个不安全的trait中的方法也有一些编译器无法验证的盲点. 通过使用`unsafe impl`, 我们就是在说明我们来保证这些有疑虑的地方的安全.

举个例子, 回想一下第16章中的`Sync`和`Send`这两个标记trait, 如果我们的类型全部由`Send`和`Sync`类型组合而成, 编译器会自动实现它们. 如果我们要实现的一个类型包含了不是`Send`或`Sync`的东西, 比如原生指针, 若是我们像把我们的类型标记成`Send`或`Sync`, 这就要求使用`unsafe`关键字. Rust不能验证我们的类型能保证可以安全地跨线程发送或从多个线程访问, 所以我们需要用`unsafe`关键字来表明我们会自己来做这些检查.

使用`unsafe`来执行这四个动作之一是没有问题的, 因为编译器不能确保内存安全, 所以把
`unsafe`代码写正确也实属不易. 当你需要使用`unsafe`代码时, 你可以这样做, 明确注明`unsafe`, 这样如果出现问题可以更容易地追踪问题的源头.
