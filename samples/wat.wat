;; Line comment
(; Block comment ;)

(module
  ;; Type declarations
  (type $sig (func (param i32 i32) (result i32)))

  ;; Imported function
  (import "env" "log" (func $log (param i32)))

  ;; Memory declaration
  (memory (export "memory") 1)

  ;; Global variable
  (global $counter (mut i32) (i32.const 0))

  ;; Table and element segment
  (table 1 funcref)
  (elem (i32.const 0) $add)

  ;; Data segment
  (data (i32.const 0) "hello")

  ;; Function with locals and control flow
  (func $add (param $a i32) (param $b i32) (result i32)
    (local $tmp i32)
    local.get $a
    local.get $b
    i32.add
  )

  ;; Control flow: block, loop, if/else
  (func $control (param $n i32) (result i32)
    (block $exit
      (loop $repeat
        local.get $n
        i32.eqz
        if
          i32.const 42
          return
        else
          local.get $n
          i32.const 1
          i32.sub
          local.set $n
        end
        br $repeat
      )
    )
    i32.const 0
  )

  ;; Exported function
  (func (export "main") (result i32)
    i32.const 10
    i32.const 20
    call $add
  )

  ;; Floating-point values
  (func $floats (result f64)
    f64.const 3.14
    f64.const 2.72
    f64.add
  )

  ;; Memory operations with alignment
  (func $mem_ops
    i32.const 0
    i32.const 255
    i32.store align=4
  )
)
