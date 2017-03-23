## 哈希 map

> [ch08-03-hash-maps.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch08-03-hash-maps.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

最后要介绍的常用集合类型是**哈希 map**（*hash map*）。`HashMap<K, V>`类型储存了一个键类型`K`对应一个值类型`V`的映射。它通过一个**哈希函数**（*hashing function*）来实现映射，它决定了如何将键和值放入内存中。很多编程语言支持这种数据结构，不过通常有不同的名字：哈希、map、对象、哈希表或者关联数组，仅举几例。

哈希 map 可以用于需要任何类型作为键来寻找数据的情况，而不是像 vector 那样通过索引。例如，在一个游戏中，你可以将每个团队的分数记录到哈希 map 中，其中键是队伍的名字而值是每个队伍的分数。给出一个队名，就能得到他们的得分。

本章我们会介绍哈希 map 的基本 API，不过还有更多吸引人的功能隐藏于标准库中的`HashMap`定义的函数中。请一如既往地查看标准库文档来了解更多信息。

### 新建一个哈希 map

可以使用`new`创建一个空的`HashMap`，并使用`insert`来增加元素。这里我们记录两支队伍的分数，分别是蓝队和黄队。蓝队开始有 10 分而黄队开始有 50 分：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```

注意必须首先`use`标准库中集合部分的`HashMap`。在这三个常用集合中，这个是最不常用的，所以并不包含在被 prelude 自动引用的功能中。标准库中对哈希 map 的支持也相对较少；例如，并没有内建的用于构建的宏。

就像 vector 一样，哈希 map 将他们的数据储存在堆上。这个`HashMap`的键类型是`String`而值类型是`i32`。同样类似于 vector，哈希 map 是同质的：所有的键必须是相同类型，值也必须都是相同类型。

另一个构建哈希 map 的方法是使用一个元组的 vector 的`collect`方法，其中每个元组包含一个键值对。`collect`方法可以将数据收集进一系列的集合类型，包括`HashMap`。例如，如果队伍的名字和初始分数分别在两个 vector 中，可以使用`zip`方法来创建一个元组的 vector，其中“Blue”与 10 是一对，依此类推。接着就可以使用`collect`方法将这个元组 vector 转换成一个`HashMap`：

```rust
use std::collections::HashMap;

let teams  = vec![String::from("Blue"), String::from("Yellow")];
let initial_scores = vec![10, 50];

let scores: HashMap<_, _> = teams.iter().zip(initial_scores.iter()).collect();
```

这里`HashMap<_, _>`类型注解是必要的，因为可能`collect`进很多不同的数据结构，而除非显式指定 Rust 无从得知你需要的类型。但是对于键和值的参数来说，可以使用下划线而 Rust 可以根据 vector 中数据的类型推断出哈希 map 所包含的类型。

### 哈希 map 和所有权

对于像`i32`这样的实现了`Copy` trait 的类型，其值可以拷贝进哈希 map。对于像`String`这样拥有所有权的值，其值将被移动而哈希 map 会成为这些值的所有者：

```rust
use std::collections::HashMap;

let field_name = String::from("Favorite color");
let field_value = String::from("Blue");

let mut map = HashMap::new();
map.insert(field_name, field_value);
// field_name and field_value are invalid at this point
```

当`insert`调用将`field_name`和`field_value`移动到哈希 map 中后，将不能使用这两个绑定。

如果将值的引用插入哈希 map，这些值本身将不会被移动进哈希 map。但是这些引用指向的值必须至少在哈希 map 有效时也是有效的。第十章生命周期部分将会更多的讨论这个问题。

### 访问哈希 map 中的值

可以通过`get`方法并提供对应的键来从哈希 map 中获取值：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score = scores.get(&team_name);
```

这里，`score`将会是与蓝队分数相关的值，而这个值将是`Some(10)`。因为`get`返回`Option<V>`所以结果被封装进`Some`；如果某个键在哈希 map 中没有对应的值，`get`会返回`None`。程序将需要采用第六章提到的方法中之一来处理`Option`。

可以使用与 vector 类似的方式来遍历哈希 map 中的每一个键值对，也就是`for`循环：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

这会以任意顺序打印出每一个键值对：

```
Yellow: 50
Blue: 10
```

### 更新哈希 map

虽然键值对的数量是可以增长的，不过每个单独的键同时只能关联一个值。当你想要改变哈希 map 中的数据时，必须选择是用新值替代旧值，还是完全无视旧值。我们也可以选择保留旧值而忽略新值，并只在键**没有**对应一个值时增加新值。或者可以结合新值和旧值。让我们看看着每一种方式是如何工作的！

#### 覆盖一个值

如果我们插入了一个键值对，接着用相同的键插入一个不同的值，与这个键相关联的旧值将被替换。即便下面的代码调用了两次`insert`，哈希 map 也只会包含一个键值对，因为两次都是对蓝队的键插入的值：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);

println!("{:?}", scores);
```

这会打印出`{"Blue": 25}`。原始的值 10 将被覆盖。

#### 只在键没有对应值时插入

我们经常会检查某个特定的键是否有值，如果没有就插入一个值。为此哈希 map 有一个特有的 API，叫做`entry`，它获取我们想要检查的键作为参数。`entry`函数的返回值是一个枚举，`Entry`，它代表了可能存在也可能不存在的值。比如说我们想要检查黄队的键是否关联了一个值。如果没有，就插入值 50，对于蓝队也是如此。使用 entry API 的代码看起来像这样：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

scores.entry(String::from("Yellow")).or_insert(50);
scores.entry(String::from("Blue")).or_insert(50);

println!("{:?}", scores);
```

`Entry`的`or_insert`方法在键对应的值存在时就返回这个值的`Entry`，如果不存在则将参数作为新值插入并返回修改过的`Entry`。这比编写自己的逻辑要简明的多，另外也与借用检查器结合得更好。

这段代码会打印出`{"Yellow": 50, "Blue": 10}`。第一个`entry`调用会插入黄队的键和值 50，因为黄队并没有一个值。第二个`entry`调用不会改变哈希 map 因为蓝队已经有了值 10。

#### 根据旧值更新一个值

另一个常见的哈希 map 的应用场景是找到一个键对应的值并根据旧的值更新它。例如，如果我们想要计数一些文本中每一个单词分别出现了多少次，就可以使用哈希 map，以单词作为键并递增其值来记录我们遇到过几次这个单词。如果是第一次看到某个单词，就插入值`0`。


```rust
use std::collections::HashMap;

let text = "hello world wonderful world";

let mut map = HashMap::new();

for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

println!("{:?}", map);
```

这会打印出`{"world": 2, "hello": 1, "wonderful": 1}`，`or_insert`方法事实上会返回这个键的值的一个可变引用（`&mut V`）。这里我们将这个可变引用储存在`count`变量中，所以为了赋值必须首先使用星号（`*`）解引用`count`。这个可变引用在`for`循环的结尾离开作用域，这样所有这些改变都是安全的并被借用规则所允许。

### 哈希函数

`HashMap`默认使用一个密码学上是安全的哈希函数，它可以提供抵抗拒绝服务（Denial of Service, DoS）攻击的能力。这并不是现有最快的哈希函数，不过为了更好的安全性带来一些性能下降也是值得的。如果你监控你的代码并发现默认哈希函数对你来说非常慢，可以通过指定一个不同的 *hasher* 来切换为另一个函数。hasher 是一个实现了`BuildHasher` trait 的类型。第十章会讨论 trait 和如何实现他们。你并不需要从头开始实现你自己的 hasher；crates.io 有其他人分享的实现了许多常用哈希算法的 hasher 的库。

## 总结

vector、字符串和哈希 map 会在你的程序需要储存、访问和修改数据时帮助你。这里有一些你应该能够解决的练习问题：

* 给定一系列数字，使用 vector 并返回这个列表的平均数（mean, average）、中位数（排列数组后位于中间的值）和众数（mode，出现次数最多的值；这里哈希函数会很有帮助）。
* 将字符串转换为 Pig Latin，也就是每一个单词的第一个辅音字母被移动到单词的结尾并增加“ay”，所以“first”会变成“irst-fay”。元音字母开头的单词则在结尾增加 “hay”（“apple”会变成“apple-hay”）。牢记 UTF-8 编码！
* 使用哈希 map 和 vector，创建一个文本接口来允许用户向公司的部门中增加员工的名字。例如，“Add Sally to Engineering”或“Add Amir to Sales”。接着让用户获取一个部门的所有员工的列表，或者公司每个部门的所有员工按照字母顺排序的列表。

标准库 API 文档中描述的这些类型的方法将有助于你进行这些练习！

我们已经开始接触可能会有失败操作的复杂程序了，这也意味着接下来是一个了解错误处理的绝佳时机！