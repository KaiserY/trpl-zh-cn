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

As an example, let's check out some functionality from the standard library,
`split_at_mut`, and explore how we might implement it ourselves. This safe
method is defined on mutable slices, and it takes one slice and makes it into
two by splitting the slice at the index given as an argument, as demonstrated
in Listing 19-4:

```rust
let mut v = vec![1, 2, 3, 4, 5, 6];

let r = &mut v[..];

let (a, b) = r.split_at_mut(3);

assert_eq!(a, &mut [1, 2, 3]);
assert_eq!(b, &mut [4, 5, 6]);
```

<span class="caption">Listing 19-4: Using the safe `split_at_mut`
function</span>

This function can't be implemented using only safe Rust. An attempt might look
like Listing 19-5. For simplicity, we're implementing `split_at_mut` as a
function rather than a method, and only for slices of `i32` values rather than
for a generic type `T`:

```rust,ignore
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();

    assert!(mid <= len);

    (&mut slice[..mid],
     &mut slice[mid..])
}
```

<span class="caption">Listing 19-5: An attempted implementation of
`split_at_mut` using only safe Rust</span>

This function first gets the total length of the slice, then asserts that the
index given as a parameter is within the slice by checking that the parameter
is less than or equal to the length. The assertion means that if we pass an
index that's greater than the length of the slice to split at, the function
will panic before it attempts to use that index.

Then we return two mutable slices in a tuple: one from the start of the initial
slice to the `mid` index, and another from `mid` to the end of the slice.

If we try to compile this, we'll get an error:

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

Rust's borrow checker can't understand that we're borrowing different parts of
the slice; it only knows that we're borrowing from the same slice twice.
Borrowing different parts of a slice is fundamentally okay; our two `&mut
[i32]`s aren't overlapping. However, Rust isn't smart enough to know this. When
we know something is okay, but Rust doesn't, it's time to reach for unsafe code.

Listing 19-6 shows how to use an `unsafe` block, a raw pointer, and some calls
to unsafe functions to make the implementation of `split_at_mut` work:

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

<span class="caption">Listing 19-6: Using unsafe code in the implementation of
the `split_at_mut` function</span>

Recall from Chapter 4 that slices are a pointer to some data and the length of
the slice. We've often used the `len` method to get the length of a slice; we
can use the `as_mut_ptr` method to get access to the raw pointer of a slice. In
this case, since we have a mutable slice to `i32` values, `as_mut_ptr` returns
a raw pointer with the type `*mut i32`, which we've stored in the variable
`ptr`.

The assertion that the `mid` index is within the slice stays the same. Then,
the `slice::from_raw_parts_mut` function does the reverse from the `as_mut_ptr`
and `len` methods: it takes a raw pointer and a length and creates a slice. We
call `slice::from_raw_parts_mut` to create a slice that starts from `ptr` and is
`mid` items long. Then we call the `offset` method on `ptr` with `mid` as an
argument to get a raw pointer that starts at `mid`, and we create a slice using
that pointer and the remaining number of items after `mid` as the length.

Because slices are checked, they're safe to use once we've created them. The
function `slice::from_raw_parts_mut` is an unsafe function because it takes a
raw pointer and trusts that this pointer is valid. The `offset` method on raw
pointers is also unsafe, since it trusts that the location some offset after a
raw pointer is also a valid pointer. We've put an `unsafe` block around our
calls to `slice::from_raw_parts_mut` and `offset` to be allowed to call them,
and we can tell by looking at the code and by adding the assertion that `mid`
must be less than or equal to `len` that all the raw pointers used within the
`unsafe` block will be valid pointers to data within the slice. This is an
acceptable and appropriate use of `unsafe`.

Note that the resulting `split_at_mut` function is safe: we didn't have to add
the `unsafe` keyword in front of it, and we can call this function from safe
Rust. We've created a safe abstraction to the unsafe code by writing an
implementation of the function that uses `unsafe` code in a safe way by only
creating valid pointers from the data this function has access to.

In contrast, the use of `slice::from_raw_parts_mut` in Listing 19-7 would
likely crash when the slice is used. This code takes an arbitrary memory
location and creates a slice ten thousand items long:

```rust
use std::slice;

let address = 0x012345;
let r = address as *mut i32;

let slice = unsafe {
    slice::from_raw_parts_mut(r, 10000)
};
```

<span class="caption">Listing 19-7: Creating a slice from an arbitrary memory
location</span>

We don't own the memory at this arbitrary location, and there's no guarantee
that the slice this code creates contains valid `i32` values. Attempting to use
`slice` as if it was a valid slice would be undefined behavior.

#### `extern`  Functions for Calling External Code are Unsafe

Sometimes, your Rust code may need to interact with code written in another
language. To do this, Rust has a keyword, `extern`, that facilitates creating
and using a *Foreign Function Interface* (FFI). Listing 19-8 demonstrates how
to set up an integration with a function named `some_function` defined in an
external library written in a language other than Rust. Functions declared
within `extern` blocks are always unsafe to call from Rust code:

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
extern "C" {
    fn some_function();
}

fn main() {
    unsafe { some_function() };
}
```

<span class="caption">Listing 19-8: Declaring and calling an `extern` function
defined in another language</span>

Within the `extern "C"` block, we list the names and signatures of functions
defined in a library written in another language that we want to be able to
call.`"C"` defines which *application binary interface* (ABI) the external
function uses. The ABI defines how to call the function at the assembly level.
The `"C"` ABI is the most common, and follows the C programming language's ABI.

Calling an external function is always unsafe. If we're calling into some other
language, that language does not enforce Rust's safety guarantees. Since Rust
can't check that the external code is safe, we are responsible for checking the
safety of the external code and indicating we have done so by using an `unsafe`
block to call external functions.

<!-- PROD: START BOX -->

##### Calling Rust Functions from Other Languages

The `extern` keyword is also used for creating an interface that allows other
languages to call Rust functions. Instead of an `extern` block, we can add the
`extern` keyword and specifying the ABI to use just before the `fn` keyword. We
also add the `#[no_mangle]` annotation to tell the Rust compiler not to mangle
the name of this function. The `call_from_c` function in this example would be
accessible from C code, once we've compiled to a shared library and linked from
C:

```rust
#[no_mangle]
pub extern "C" fn call_from_c() {
    println!("Just called a Rust function from C!");
}
```

This usage of `extern` does not require `unsafe`

<!-- PROD: END BOX -->

### Accessing or Modifying a Mutable Static Variable

We've gone this entire book without talking about *global variables*. Many
programming languages support them, and so does Rust. However, global variables
can be problematic: for example, if you have two threads accessing the same
mutable global variable, a data race can happen.

Global variables are called *static* in Rust. Listing 19-9 shows an example
declaration and use of a static variable with a string slice as a value:

<span class="filename">Filename: src/main.rs</span>

```rust
static HELLO_WORLD: &str = "Hello, world!";

fn main() {
    println!("name is: {}", HELLO_WORLD);
}
```

<span class="caption">Listing 19-9: Defining and using an immutable static
variable</span>

`static` variables are similar to constants: their names are also in
`SCREAMING_SNAKE_CASE` by convention, and we *must* annotate the variable's
type, which is `&'static str` in this case. Only references with the `'static`
lifetime may be stored in a static variable. Because of this, the Rust compiler
can figure out the lifetime by itself and we don't need to annotate it explicitly.
Accessing immutable static variables is safe. Values in a static variable have a
fixed address in memory, and using the value will always access the same data.
Constants, on the other hand, are allowed to duplicate their data whenever they
are used.

Another way in which static variables are different from constants is that
static variables can be mutable. Both accessing and modifying mutable static
variables is unsafe. Listing 19-10 shows how to declare, access, and modify a
mutable static variable named `COUNTER`:

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

<span class="caption">Listing 19-10: Reading from or writing to a mutable
static variable is unsafe</span>

Just like with regular variables, we specify that a static variable should be
mutable using the `mut` keyword. Any time that we read or write from `COUNTER`
has to be within an `unsafe` block. This code compiles and prints `COUNTER: 3`
as we would expect since it's single threaded, but having multiple threads
accessing `COUNTER` would likely result in data races.

Mutable data that is globally accessible is difficult to manage and ensure that
there are no data races, which is why Rust considers mutable static variables
to be unsafe. If possible, prefer using the concurrency techniques and
threadsafe smart pointers we discussed in Chapter 16 to have the compiler check
that data accessed from different threads is done safely.

### Implementing an Unsafe Trait

Finally, the last action we're only allowed to take when we use the `unsafe`
keyword is implementing an unsafe trait. We can declare that a trait is
`unsafe` by adding the `unsafe` keyword before `trait`, and then implementing
the trait must be marked as `unsafe` too, as shown in Listing 19-11:

```rust
unsafe trait Foo {
    // methods go here
}

unsafe impl Foo for i32 {
    // method implementations go here
}
```

<span class="caption">Listing 19-11: Defining and implementing an unsafe
trait</span>

Like unsafe functions, methods in an unsafe trait have some invariant that the
compiler cannot verify. By using `unsafe impl`, we're promising that we'll
uphold these invariants.

As an example, recall the `Sync` and `Send` marker traits from Chapter 16, and
that the compiler implements these automatically if our types are composed
entirely of `Send` and `Sync` types. If we implement a type that contains
something that's not `Send` or `Sync` such as raw pointers, and we want to mark
our type as `Send` or `Sync`, that requires using `unsafe`. Rust can't verify
that our type upholds the guarantees that a type can be safely sent across
threads or accessed from multiple threads, so we need to do those checks
ourselves and indicate as such with `unsafe`.

Using `unsafe` to take one of these four actions isn't wrong or frowned upon,
but it is trickier to get `unsafe` code correct since the compiler isn't able
to help uphold memory safety. When you have a reason to use `unsafe` code,
however, it's possible to do so, and having the explicit `unsafe` annotation
makes it easier to track down the source of problems if they occur.
