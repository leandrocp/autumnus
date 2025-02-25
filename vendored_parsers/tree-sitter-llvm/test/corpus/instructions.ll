================================================================================
ret
================================================================================

define void @main() {
  ret i32 5                       ; Return an integer value of 5
  ret void                        ; Return from a void function
  ret { i32, i8 } { i32 4, i8 2 } ; Return a struct of values 4 and 2
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (instruction_ret
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (instruction_ret
          (type_and_value
            (type
              (type_keyword)))))
      (comment)
      (instruction
        (instruction_ret
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (type_keyword)))))
            (value
              (struct_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))))
      (comment))))

================================================================================
br
================================================================================

define void @main() {
Test:
  %cond = icmp eq i32 %a, %b
  br i1 %cond, label %IfEqual, label %IfUnequal
IfEqual:
  ret i32 1
IfUnequal:
  ret i32 0
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (label)
      (instruction
        (local_var)
        (instruction_icmp
          (icmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (value
            (var
              (local_var)))))
      (instruction
        (instruction_br
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (label)
      (instruction
        (instruction_ret
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (label)
      (instruction
        (instruction_ret
          (type_and_value
            (type
              (type_keyword))
            (value
              (number))))))))

================================================================================
switch
================================================================================

define void @main() {
  ; Emulate a conditional br instruction
  %Val = zext i1 %value to i32
  switch i32 %Val, label %truedest [ i32 0, label %falsedest ]
  
  ; Emulate an unconditional br instruction
  switch i32 0, label %dest [ ]
  
  ; Implement a jump table:
  switch i32 %val, label %otherwise [ i32 0, label %onzero
                                     i32 1, label %onone
                                     i32 2, label %ontwo ]
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type
            (type_keyword))))
      (instruction
        (instruction_switch
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment)
      (instruction
        (instruction_switch
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment)
      (instruction
        (instruction_switch
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
indirectbr
================================================================================

define void @main() {
  indirectbr i8* %Addr, [ label %bb1, label %bb2, label %bb3 ]
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (instruction_indirectbr
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
invoke
================================================================================

define void @main() {
  %retval = invoke i32 @Test(i32 15) to label %Continue
              unwind label %TestCleanup              ; i32:retval set
  %retval = invoke coldcc i32 %Testfnptr(i32 15) to label %Continue
              unwind label %TestCleanup              ; i32:retval set
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_invoke
          (type
            (type_keyword))
          (value
            (var
              (global_var)))
          (argument_list
            (argument
              (type
                (type_keyword))
              (value
                (number))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment)
      (instruction
        (local_var)
        (instruction_invoke
          (calling_conv)
          (type
            (type_keyword))
          (value
            (var
              (local_var)))
          (argument_list
            (argument
              (type
                (type_keyword))
              (value
                (number))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment))))

================================================================================
callbr
================================================================================

define void @main() {
  ; "asm goto" without output constraints.
  callbr void asm "", "r,X"(i32 %x, i8 *blockaddress(@foo, %indirect))
              to label %fallthrough [label %indirect]
  
  ; "asm goto" with output constraints.
  %result = callbr i32 asm "", "=r,r,X"(i32 %x, i8 *blockaddress(@foo, %indirect))
               to label %fallthrough [label %indirect]
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (comment)
      (instruction
        (instruction_callbr
          (type
            (type_keyword))
          (inline_asm
            (asm
              (string))
            (string))
          (argument_list
            (argument
              (type
                (type_keyword))
              (value
                (var
                  (local_var))))
            (argument
              (type
                (type_keyword))
              (value
                (blockaddress
                  (global_var)
                  (local_var)))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment)
      (instruction
        (local_var)
        (instruction_callbr
          (type
            (type_keyword))
          (inline_asm
            (asm
              (string))
            (string))
          (argument_list
            (argument
              (type
                (type_keyword))
              (value
                (var
                  (local_var))))
            (argument
              (type
                (type_keyword))
              (value
                (blockaddress
                  (global_var)
                  (local_var)))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
resume
================================================================================

define void @main() {
  resume { i8*, i32 } %exn
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (instruction_resume
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var)))))))))

================================================================================
catchswitch
================================================================================

define void @main() {
dispatch1:
  %cs1 = catchswitch within none [label %handler0, label %handler1] unwind to caller
dispatch2:
  %cs2 = catchswitch within %parenthandler [label %handler0] unwind label %cleanup
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (label)
      (instruction
        (local_var)
        (instruction_catchswitch
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (label)
      (instruction
        (local_var)
        (instruction_catchswitch
          (local_var)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
catchret
================================================================================

define void @main() {
  catchret from %catch to label %continue
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (instruction_catchret
          (local_var)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
cleanupret
================================================================================

define void @main() {
  cleanupret from %cleanup unwind to caller
  cleanupret from %cleanup unwind label %continue
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (instruction_cleanupret
          (local_var)))
      (instruction
        (instruction_cleanupret
          (local_var)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
fneg
================================================================================

define void @main() {
  %result = fneg float %val          ; yields float:result = -%var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_fneg
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment))))

================================================================================
add
================================================================================

define void @main() {
  %result = add i32 4, %var          ; yields i32:result = 4 + %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
fadd
================================================================================

define void @main() {
  %result = fadd float 4.0, %var          ; yields float:result = 4.0 + %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
sub
================================================================================

define void @main() {
  %result = sub i32 4, %var          ; yields i32:result = 4 - %var
  %result = sub i32 0, %val          ; yields i32:result = -%var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
fsub
================================================================================

define void @main() {
  %result = fsub float 4.0, %var           ; yields float:result = 4.0 - %var
  %result = fsub float -0.0, %val          ; yields float:result = -%var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (var
              (local_var)))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
mul
================================================================================

define void @main() {
  %result = mul i32 4, %var          ; yields i32:result = 4 * %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
fmul
================================================================================

define void @main() {
  %result = fmul float 4.0, %var          ; yields float:result = 4.0 * %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
sdiv
================================================================================

define void @main() {
  %result = sdiv i32 4, %var          ; yields i32:result = 4 / %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
fdiv
================================================================================

define void @main() {
  %result = fdiv float 4.0, %var          ; yields float:result = 4.0 / %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
urem
================================================================================

define void @main() {
  %result = urem i32 4, %var          ; yields i32:result = 4 % %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
srem
================================================================================

define void @main() {
  %result = srem i32 4, %var          ; yields i32:result = 4 % %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
frem
================================================================================

define void @main() {
  %result = frem float 4.0, %var          ; yields float:result = 4.0 % %var
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (var
              (local_var)))))
      (comment))))

================================================================================
shl
================================================================================

define void @main() {
  %result = shl i32 4, %var   ; yields i32: 4 << %var
  %result = shl i32 4, 2      ; yields i32: 16
  %result = shl i32 1, 10     ; yields i32: 1024
  %result = shl i32 1, 32     ; undefined
  %result = shl <2 x i32> < i32 1, i32 1>, < i32 1, i32 2>   ; yields: result=<2 x i32> < i32 2, i32 4>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))
          (value
            (vector_value
              (type_and_value
                (type
                  (type_keyword))
                (value
                  (number)))
              (type_and_value
                (type
                  (type_keyword))
                (value
                  (number)))))))
      (comment))))

================================================================================
lshr
================================================================================

define void @main() {
  %result = lshr i32 4, 1   ; yields i32:result = 2
  %result = lshr i32 4, 2   ; yields i32:result = 1
  %result = lshr i8  4, 3   ; yields i8:result = 0
  %result = lshr i8 -2, 1   ; yields i8:result = 0x7F
  %result = lshr i32 1, 32  ; undefined
  %result = lshr <2 x i32> < i32 -2, i32 4>, < i32 1, i32 2>   ; yields: result=<2 x i32> < i32 0x7FFFFFFF, i32 1>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))
          (value
            (vector_value
              (type_and_value
                (type
                  (type_keyword))
                (value
                  (number)))
              (type_and_value
                (type
                  (type_keyword))
                (value
                  (number)))))))
      (comment))))

================================================================================
ashr
================================================================================

define void @main() {
  %result = ashr i32 4, 1   ; yields i32:result = 2
  %result = ashr i32 4, 2   ; yields i32:result = 1
  %result = ashr i8  4, 3   ; yields i8:result = 0
  %result = ashr i8 -2, 1   ; yields i8:result = -1
  %result = ashr i32 1, 32  ; undefined
  %result = ashr <2 x i32> < i32 -2, i32 4>, < i32 1, i32 3>   ; yields: result=<2 x i32> < i32 -1, i32 0>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))
          (value
            (vector_value
              (type_and_value
                (type
                  (type_keyword))
                (value
                  (number)))
              (type_and_value
                (type
                  (type_keyword))
                (value
                  (number)))))))
      (comment))))

================================================================================
and
================================================================================

define void @main() {
  %result = and i32 4, %var         ; yields i32:result = 4 & %var
  %result = and i32 15, 40          ; yields i32:result = 8
  %result = and i32 4, 8            ; yields i32:result = 0
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment))))

================================================================================
or
================================================================================

define void @main() {
  %result = or i32 4, %var         ; yields i32:result = 4 | %var
  %result = or i32 15, 40          ; yields i32:result = 47
  %result = or i32 4, 8            ; yields i32:result = 12
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment))))

================================================================================
xor
================================================================================

define void @main() {
  %result = xor i32 4, %var         ; yields i32:result = 4 ^ %var
  %result = xor i32 15, 40          ; yields i32:result = 39
  %result = xor i32 4, 8            ; yields i32:result = 12
  %result = xor i32 %V, -1          ; yields i32:result = ~%V
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (var
              (local_var)))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (value
            (number))))
      (comment))))

================================================================================
extractelement
================================================================================

define void @main() {
  %result = extractelement <4 x i32> %vec, i32 0    ; yields i32
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_extractelement
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment))))

================================================================================
insertelement
================================================================================

define void @main() {
  %result = insertelement <4 x i32> %vec, i32 1, i32 0    ; yields <4 x i32>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_insertelement
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment))))

================================================================================
shufflevector
================================================================================

define void @main() {
  %result = shufflevector <4 x i32> %v1, <4 x i32> %v2,
                          <4 x i32> <i32 0, i32 4, i32 1, i32 5>  ; yields <4 x i32>
  %result = shufflevector <4 x i32> %v1, <4 x i32> undef,
                          <4 x i32> <i32 0, i32 1, i32 2, i32 3>  ; yields <4 x i32> - Identity shuffle.
  %result = shufflevector <8 x i32> %v1, <8 x i32> undef,
                          <4 x i32> <i32 0, i32 1, i32 2, i32 3>  ; yields <4 x i32>
  %result = shufflevector <4 x i32> %v1, <4 x i32> %v2,
                          <8 x i32> <i32 0, i32 1, i32 2, i32 3, i32 4, i32 5, i32 6, i32 7 >  ; yields <8 x i32>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_shufflevector
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))))
      (comment)
      (instruction
        (local_var)
        (instruction_shufflevector
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))))
      (comment)
      (instruction
        (local_var)
        (instruction_shufflevector
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))))
      (comment)
      (instruction
        (local_var)
        (instruction_shufflevector
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))))
      (comment))))

================================================================================
extractvalue
================================================================================

define void @main() {
  %result = extractvalue {i32, float} %agg, 0    ; yields i32
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_extractvalue
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (number)))
      (comment))))

================================================================================
insertvalue
================================================================================

define void @main() {
  %agg1 = insertvalue {i32, float} undef, i32 1, 0              ; yields {i32 1, float undef}
  %agg2 = insertvalue {i32, float} %agg1, float %val, 1         ; yields {i32 1, float %val}
  %agg3 = insertvalue {i32, {float}} undef, float %val, 1, 0    ; yields {i32 undef, {float %val}}
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_insertvalue
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (type_keyword)))))
            (value))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (number)))
      (comment)
      (instruction
        (local_var)
        (instruction_insertvalue
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (number)))
      (comment)
      (instruction
        (local_var)
        (instruction_insertvalue
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (struct_type
                      (struct_body
                        (type
                          (type_keyword))))))))
            (value))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (number)
          (number)))
      (comment))))

================================================================================
alloca
================================================================================

define void @main() {
  %ptr = alloca i32                             ; yields i32*:ptr
  %ptr = alloca i32, i32 4                      ; yields i32*:ptr
  %ptr = alloca i32, i32 4, align 1024          ; yields i32*:ptr
  %ptr = alloca i32, align 1024                 ; yields i32*:ptr
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_alloca
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_alloca
          (type
            (type_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_alloca
          (type
            (type_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (alignment
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_alloca
          (type
            (type_keyword))
          (alignment
            (number))))
      (comment))))

================================================================================
load
================================================================================

define void @main() {
  %ptr = alloca i32                               ; yields i32*:ptr
  store i32 3, i32* %ptr                          ; yields void
  %val = load i32, i32* %ptr                      ; yields i32:val = i32 3
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_alloca
          (type
            (type_keyword))))
      (comment)
      (instruction
        (instruction_store
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment)
      (instruction
        (local_var)
        (instruction_load
          (type
            (type_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment))))

================================================================================
store
================================================================================

define void @main() {
  %ptr = alloca i32                               ; yields i32*:ptr
  store i32 3, i32* %ptr                          ; yields void
  %val = load i32, i32* %ptr                      ; yields i32:val = i32 3
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_alloca
          (type
            (type_keyword))))
      (comment)
      (instruction
        (instruction_store
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment)
      (instruction
        (local_var)
        (instruction_load
          (type
            (type_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment))))

================================================================================
fence
================================================================================

define void @main() {
  fence acquire                                        ; yields void
  fence syncscope("singlethread") seq_cst              ; yields void
  fence syncscope("agent") seq_cst                     ; yields void
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (instruction_fence
          (atomic_ordering)))
      (comment)
      (instruction
        (instruction_fence
          (syncscope
            (string))
          (atomic_ordering)))
      (comment)
      (instruction
        (instruction_fence
          (syncscope
            (string))
          (atomic_ordering)))
      (comment))))

================================================================================
cmpxchg
================================================================================

define void @main() {
entry:
  %orig = load atomic i32, i32* %ptr unordered, align 4                      ; yields i32
  br label %loop

loop:
  %cmp = phi i32 [ %orig, %entry ], [%value_loaded, %loop]
  %squared = mul i32 %cmp, %cmp
  %val_success = cmpxchg i32* %ptr, i32 %cmp, i32 %squared acq_rel monotonic ; yields  { i32, i1 }
  %value_loaded = extractvalue { i32, i1 } %val_success, 0
  %success = extractvalue { i32, i1 } %val_success, 1
  br i1 %success, label %done, label %loop

done:
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (label)
      (instruction
        (local_var)
        (instruction_load
          (type
            (type_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (atomic_ordering)
          (number)))
      (comment)
      (instruction
        (instruction_br
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (label)
      (instruction
        (local_var)
        (instruction_phi
          (type
            (type_keyword))
          (value
            (var
              (local_var)))
          (local_var)
          (value
            (var
              (local_var)))
          (local_var)))
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (value
            (var
              (local_var)))))
      (instruction
        (local_var)
        (instruction_cmpxchg
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (atomic_ordering)
          (atomic_ordering)))
      (comment)
      (instruction
        (local_var)
        (instruction_extractvalue
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (number)))
      (instruction
        (local_var)
        (instruction_extractvalue
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (number)))
      (instruction
        (instruction_br
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (label))))

================================================================================
atomicrmw
================================================================================

define void @main() {
  %old = atomicrmw add i32* %ptr, i32 1 acquire                        ; yields i32
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_atomicrmw
          (atomic_bin_op_keyword)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (atomic_ordering)))
      (comment))))

================================================================================
getelementptr
================================================================================

%struct.RT = type { i8, [10 x [20 x i32]], i8 }
%struct.ST = type { i32, double, %struct.RT }

define i32* @foo(%struct.ST* %s) nounwind uwtable readnone optsize ssp {
entry:
  %arrayidx = getelementptr inbounds %struct.ST, %struct.ST* %s, i64 1, i32 2, i32 1, i64 5, i64 13
  ret i32* %arrayidx
}

--------------------------------------------------------------------------------

(module
  (global_type
    (local_var)
    (type
      (struct_type
        (struct_body
          (type
            (type_keyword))
          (type
            (array_type
              (array_vector_body
                (number)
                (type
                  (array_type
                    (array_vector_body
                      (number)
                      (type
                        (type_keyword))))))))
          (type
            (type_keyword))))))
  (global_type
    (local_var)
    (type
      (struct_type
        (struct_body
          (type
            (type_keyword))
          (type
            (type_keyword))
          (type
            (local_var))))))
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list
        (argument
          (type
            (local_var))
          (value
            (var
              (local_var)))))
      (attribute
        (attribute_name))
      (attribute
        (attribute_name
          (uwtable)))
      (attribute
        (attribute_name))
      (attribute
        (attribute_name))
      (attribute
        (attribute_name)))
    (function_body
      (label)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (local_var)))
          (type_and_value
            (type
              (local_var))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (instruction
        (instruction_ret
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
getelementptr 2
================================================================================

define i32* @foo(%struct.ST* %s) {
  %t1 = getelementptr %struct.ST, %struct.ST* %s, i32 1                        ; yields %struct.ST*:%t1
  %t2 = getelementptr %struct.ST, %struct.ST* %t1, i32 0, i32 2                ; yields %struct.RT*:%t2
  %t3 = getelementptr %struct.RT, %struct.RT* %t2, i32 0, i32 1                ; yields [10 x [20 x i32]]*:%t3
  %t4 = getelementptr [10 x [20 x i32]], [10 x [20 x i32]]* %t3, i32 0, i32 5  ; yields [20 x i32]*:%t4
  %t5 = getelementptr [20 x i32], [20 x i32]* %t4, i32 0, i32 13               ; yields i32*:%t5
  ret i32* %t5
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list
        (argument
          (type
            (local_var))
          (value
            (var
              (local_var))))))
    (function_body
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (local_var)))
          (type_and_value
            (type
              (local_var))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (local_var)))
          (type_and_value
            (type
              (local_var))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (local_var)))
          (type_and_value
            (type
              (local_var))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (array_type
                (array_vector_body
                  (number)
                  (type
                    (array_type
                      (array_vector_body
                        (number)
                        (type
                          (type_keyword)))))))))
          (type_and_value
            (type
              (array_type
                (array_vector_body
                  (number)
                  (type
                    (array_type
                      (array_vector_body
                        (number)
                        (type
                          (type_keyword))))))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (array_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword))))))
          (type_and_value
            (type
              (array_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (instruction_ret
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
getelementptr 3
================================================================================

define void @main() {
  ; yields [12 x i8]*:aptr
  %aptr = getelementptr {i32, [12 x i8]}, {i32, [12 x i8]}* %saptr, i64 0, i32 1
  ; yields i8*:vptr
  %vptr = getelementptr {i32, <2 x i8>}, {i32, <2 x i8>}* %svptr, i64 0, i32 1, i32 1
  ; yields i8*:eptr
  %eptr = getelementptr [12 x i8], [12 x i8]* %aptr, i64 0, i32 1
  ; yields i32*:iptr
  %iptr = getelementptr [10 x i32], [10 x i32]* @arr, i16 0, i16 0
  
  ; All arguments are vectors:
  ;   A[i] = ptrs[i] + offsets[i]*sizeof(i8)
  %A = getelementptr i8, <4 x i8*> %ptrs, <4 x i64> %offsets
  
  ; Add the same scalar offset to each pointer of a vector:
  ;   A[i] = ptrs[i] + offset*sizeof(i8)
  %A = getelementptr i8, <4 x i8*> %ptrs, i64 %offset
  
  ; Add distinct offsets to the same pointer:
  ;   A[i] = ptr + offsets[i]*sizeof(i8)
  %A = getelementptr i8, i8* %ptr, <4 x i64> %offsets
  
  ; In all cases described above the type of the result is <4 x i8*>
  
  getelementptr  %struct.ST, <4 x %struct.ST*> %s, <4 x i64> %ind1,
    <4 x i32> <i32 2, i32 2, i32 2, i32 2>,
    <4 x i32> <i32 1, i32 1, i32 1, i32 1>,
    <4 x i32> %ind4,
    <4 x i64> <i64 13, i64 13, i64 13, i64 13>
  
  getelementptr  %struct.ST, <4 x %struct.ST*> %s, <4 x i64> %ind1,
    i32 2, i32 1, <4 x i32> %ind4, i64 13
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (array_type
                      (array_vector_body
                        (number)
                        (type
                          (type_keyword)))))))))
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (array_type
                      (array_vector_body
                        (number)
                        (type
                          (type_keyword))))))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (vector_type
                      (array_vector_body
                        (number)
                        (type
                          (type_keyword)))))))))
          (type_and_value
            (type
              (struct_type
                (struct_body
                  (type
                    (type_keyword))
                  (type
                    (vector_type
                      (array_vector_body
                        (number)
                        (type
                          (type_keyword))))))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (array_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword))))))
          (type_and_value
            (type
              (array_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (array_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword))))))
          (type_and_value
            (type
              (array_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (global_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment)
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (type_keyword)))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))))
      (comment)
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (type_keyword)))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))))
      (comment)
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (type_keyword)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))))
      (comment)
      (instruction
        (instruction_getelementptr
          (type_and_value
            (type
              (local_var)))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (local_var)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))))
      (instruction
        (instruction_getelementptr
          (type_and_value
            (type
              (local_var)))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (local_var)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number))))))))

================================================================================
getelementptr 4
================================================================================

define void @main() {
  ; get pointers for 8 elements from array B
  %ptrs = getelementptr double, double* %B, <8 x i32> %C
  ; load 8 elements from array B into A
  %A = call <8 x double> @llvm.masked.gather.v8f64.v8p0f64(<8 x double*> %ptrs,
       i32 8, <8 x i1> %mask, <8 x double> %passthru)
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (comment)
      (instruction
        (local_var)
        (instruction_getelementptr
          (type_and_value
            (type
              (type_keyword)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))))
      (comment)
      (instruction
        (local_var)
        (instruction_call
          (type
            (vector_type
              (array_vector_body
                (number)
                (type
                  (type_keyword)))))
          (value
            (var
              (global_var)))
          (argument_list
            (argument
              (type
                (vector_type
                  (array_vector_body
                    (number)
                    (type
                      (type_keyword)))))
              (value
                (var
                  (local_var))))
            (argument
              (type
                (type_keyword))
              (value
                (number)))
            (argument
              (type
                (vector_type
                  (array_vector_body
                    (number)
                    (type
                      (type_keyword)))))
              (value
                (var
                  (local_var))))
            (argument
              (type
                (vector_type
                  (array_vector_body
                    (number)
                    (type
                      (type_keyword)))))
              (value
                (var
                  (local_var))))))))))

================================================================================
trunc
================================================================================

define void @main() {
  %X = trunc i32 257 to i8                        ; yields i8:1
  %Y = trunc i32 123 to i1                        ; yields i1:true
  %Z = trunc i32 122 to i1                        ; yields i1:false
  %W = trunc <2 x i16> <i16 8, i16 7> to <2 x i8> ; yields <i8 8, i8 7>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))
          (type
            (vector_type
              (array_vector_body
                (number)
                (type
                  (type_keyword)))))))
      (comment))))

================================================================================
zext
================================================================================

define void @main() {
  %X = zext i32 257 to i64              ; yields i64:257
  %Y = zext i1 true to i32              ; yields i32:1
  %Z = zext <2 x i16> <i16 8, i16 7> to <2 x i32> ; yields <i32 8, i32 7>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))
          (type
            (vector_type
              (array_vector_body
                (number)
                (type
                  (type_keyword)))))))
      (comment))))

================================================================================
sext
================================================================================

define void @main() {
  %X = sext i8  -1 to i16              ; yields i16   :65535
  %Y = sext i1 true to i32             ; yields i32:-1
  %Z = sext <2 x i16> <i16 8, i16 7> to <2 x i32> ; yields <i32 8, i32 7>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (vector_value
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number)))
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (number))))))
          (type
            (vector_type
              (array_vector_body
                (number)
                (type
                  (type_keyword)))))))
      (comment))))

================================================================================
fptrunc
================================================================================

define void @main() {
  %X = fptrunc double 16777217.0 to float    ; yields float:16777216.0
  %Y = fptrunc double 1.0E+300 to half       ; yields half:+infinity
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment))))

================================================================================
fpext
================================================================================

define void @main() {
  %X = fpext float 3.125 to double         ; yields double:3.125000e+00
  %Y = fpext double %X to fp128            ; yields fp128:0xL00000000000000004000900000000000
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type
            (type_keyword))))
      (comment))))

================================================================================
fptoui
================================================================================

define void @main() {
  %X = fptoui double 123.0 to i32      ; yields i32:123
  %Y = fptoui float 1.0E+300 to i1     ; yields undefined:1
  %Z = fptoui float 1.04E+17 to i8     ; yields undefined:1
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment))))

================================================================================
fptosi
================================================================================

define void @main() {
  %X = fptosi double -123.0 to i32      ; yields i32:-123
  %Y = fptosi float 1.0E-247 to i1      ; yields undefined:1
  %Z = fptosi float 1.04E+17 to i8      ; yields undefined:1
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (type
            (type_keyword))))
      (comment))))

================================================================================
uitofp
================================================================================

define void @main() {
  %X = uitofp i32 257 to float         ; yields float:257.0
  %Y = uitofp i8 -1 to double          ; yields double:255.0
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment))))

================================================================================
sitofp
================================================================================

define void @main() {
  %X = sitofp i32 257 to float         ; yields float:257.0
  %Y = sitofp i8 -1 to double          ; yields double:-1.0
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment))))

================================================================================
ptrtoint
================================================================================

define void @main() {
  %X = ptrtoint i32* %P to i8                         ; yields truncation on 32-bit architecture
  %Y = ptrtoint i32* %P to i64                        ; yields zero extension on 32-bit architecture
  %Z = ptrtoint <4 x i32*> %P to <4 x i64>; yields vector zero extension for a vector of addresses on 32-bit architecture
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type
            (vector_type
              (array_vector_body
                (number)
                (type
                  (type_keyword)))))))
      (comment))))

================================================================================
inttoptr
================================================================================

define void @main() {
  %X = inttoptr i32 255 to i32*          ; yields zero extension on 64-bit architecture
  %Y = inttoptr i32 255 to i32*          ; yields no-op on 32-bit architecture
  %Z = inttoptr i64 0 to i32*            ; yields truncation on 32-bit architecture
  %Z = inttoptr <4 x i32> %G to <4 x i8*>; yields truncation of vector G to four pointers
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type
            (vector_type
              (array_vector_body
                (number)
                (type
                  (type_keyword)))))))
      (comment))))

================================================================================
bitcast
================================================================================

define void @main() {
  %X = bitcast i8 255 to i8          ; yields i8 :-1
  %Y = bitcast i32* %x to i32*      ; yields sint*:%x
  %Z = bitcast <2 x i32> %V to i64;  ; yields i64: %V (depends on endianess)
  %Z = bitcast <2 x i32*> %V to <2 x i64*> ; yields <2 x i64*>
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type
            (type_keyword))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type
            (vector_type
              (array_vector_body
                (number)
                (type
                  (type_keyword)))))))
      (comment))))

================================================================================
addrspacecast
================================================================================

define void @main() {
  %X = addrspacecast i32* %x to i32 addrspace(1)*    ; yields i32 addrspace(1)*:%x
  %Y = addrspacecast i32 addrspace(1)* %y to i64 addrspace(2)*    ; yields i64 addrspace(2)*:%y
  %Z = addrspacecast <4 x i32*> %z to <4 x float addrspace(3)*>   ; yields <4 x float addrspace(3)*>:%z
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type
            (type_keyword)
            (addrspace
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (type_keyword)
              (addrspace
                (number)))
            (value
              (var
                (local_var))))
          (type
            (type_keyword)
            (addrspace
              (number)))))
      (comment)
      (instruction
        (local_var)
        (instruction_cast
          (cast_inst)
          (type_and_value
            (type
              (vector_type
                (array_vector_body
                  (number)
                  (type
                    (type_keyword)))))
            (value
              (var
                (local_var))))
          (type
            (vector_type
              (array_vector_body
                (number)
                (type
                  (type_keyword)
                  (addrspace
                    (number))))))))
      (comment))))

================================================================================
icmp
================================================================================

define void @main() {
  %result = icmp eq i32 4, 5          ; yields: result=false
  %result = icmp ne float* %X, %X     ; yields: result=false
  %result = icmp ult i16  4, 5        ; yields: result=true
  %result = icmp sgt i16  4, 5        ; yields: result=false
  %result = icmp ule i16 -4, 5        ; yields: result=false
  %result = icmp sge i16  4, 5        ; yields: result=false
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_icmp
          (icmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_icmp
          (icmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (value
            (var
              (local_var)))))
      (comment)
      (instruction
        (local_var)
        (instruction_icmp
          (icmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_icmp
          (icmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_icmp
          (icmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment)
      (instruction
        (local_var)
        (instruction_icmp
          (icmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (value
            (number))))
      (comment))))

================================================================================
fcmp
================================================================================

define void @main() {
  %result = fcmp oeq float 4.0, 5.0    ; yields: result=false
  %result = fcmp one float 4.0, 5.0    ; yields: result=true
  %result = fcmp olt float 4.0, 5.0    ; yields: result=true
  %result = fcmp ueq double 1.0, 2.0   ; yields: result=false
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_fcmp
          (fcmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (float))))
      (comment)
      (instruction
        (local_var)
        (instruction_fcmp
          (fcmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (float))))
      (comment)
      (instruction
        (local_var)
        (instruction_fcmp
          (fcmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (float))))
      (comment)
      (instruction
        (local_var)
        (instruction_fcmp
          (fcmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (float)))
          (value
            (float))))
      (comment))))

================================================================================
phi
================================================================================

define void @main() {
Loop:       ; Infinite loop that counts from 0 on up...
  %indvar = phi i32 [ 0, %LoopHeader ], [ %nextindvar, %Loop ]
  %nextindvar = add i32 %indvar, 1
  br label %Loop
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (label)
      (comment)
      (instruction
        (local_var)
        (instruction_phi
          (type
            (type_keyword))
          (value
            (number))
          (local_var)
          (value
            (var
              (local_var)))
          (local_var)))
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (value
            (number))))
      (instruction
        (instruction_br
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var)))))))))

================================================================================
select
================================================================================

define void @main() {
  %X = select i1 true, i8 17, i8 42          ; yields i8:17
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_select
          (type_and_value
            (type
              (type_keyword))
            (value))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))
          (type_and_value
            (type
              (type_keyword))
            (value
              (number)))))
      (comment))))

================================================================================
call
================================================================================

%struct.A = type { i32, i8 }

define void @main() {
  %retval = call i32 @test(i32 %argc)
  call i32 (i8*, ...)* @printf(i8* %msg, i32 12, i8 42)        ; yields i32
  %X = tail call i32 @foo()                                    ; yields i32
  %Y = tail call fastcc i32 @foo()  ; yields i32
  call void %foo(i8 signext 97)
  
  %r = call %struct.A @foo()                        ; yields { i32, i8 }
  %gr = extractvalue %struct.A %r, 0                ; yields i32
  %gr1 = extractvalue %struct.A %r, 1               ; yields i8
  %Z = call void @foo() noreturn                    ; indicates that %foo never returns normally
  %ZZ = call zeroext i32 @bar()                     ; Return value is %zero extended
}

--------------------------------------------------------------------------------

(module
  (global_type
    (local_var)
    (type
      (struct_type
        (struct_body
          (type
            (type_keyword))
          (type
            (type_keyword))))))
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_call
          (type
            (type_keyword))
          (value
            (var
              (global_var)))
          (argument_list
            (argument
              (type
                (type_keyword))
              (value
                (var
                  (local_var)))))))
      (instruction
        (instruction_call
          (type
            (type_keyword)
            (argument_list
              (argument
                (type
                  (type_keyword)))
              (argument)))
          (value
            (var
              (global_var)))
          (argument_list
            (argument
              (type
                (type_keyword))
              (value
                (var
                  (local_var))))
            (argument
              (type
                (type_keyword))
              (value
                (number)))
            (argument
              (type
                (type_keyword))
              (value
                (number))))))
      (comment)
      (instruction
        (local_var)
        (instruction_call
          (type
            (type_keyword))
          (value
            (var
              (global_var)))
          (argument_list)))
      (comment)
      (instruction
        (local_var)
        (instruction_call
          (calling_conv)
          (type
            (type_keyword))
          (value
            (var
              (global_var)))
          (argument_list)))
      (comment)
      (instruction
        (instruction_call
          (type
            (type_keyword))
          (value
            (var
              (local_var)))
          (argument_list
            (argument
              (type
                (type_keyword))
              (param_or_return_attrs
                (attribute_name))
              (value
                (number))))))
      (instruction
        (local_var)
        (instruction_call
          (type
            (local_var))
          (value
            (var
              (global_var)))
          (argument_list)))
      (comment)
      (instruction
        (local_var)
        (instruction_extractvalue
          (type_and_value
            (type
              (local_var))
            (value
              (var
                (local_var))))
          (number)))
      (comment)
      (instruction
        (local_var)
        (instruction_extractvalue
          (type_and_value
            (type
              (local_var))
            (value
              (var
                (local_var))))
          (number)))
      (comment)
      (instruction
        (local_var)
        (instruction_call
          (type
            (type_keyword))
          (value
            (var
              (global_var)))
          (argument_list)
          (attribute
            (attribute_name))))
      (comment)
      (instruction
        (local_var)
        (instruction_call
          (param_or_return_attrs
            (attribute_name))
          (type
            (type_keyword))
          (value
            (var
              (global_var)))
          (argument_list)))
      (comment))))

================================================================================
inline asm
================================================================================

define void @main() {
  %X = call i32 asm "bswap $0", "=r,r"(i32 %Y)
  call void asm sideeffect "eieio", ""()
  call void asm alignstack "eieio", ""()
  call void asm inteldialect "eieio", ""()
  call void asm unwind "call func", ""()
  call void asm sideeffect "something bad", ""(), !srcloc !42
}

!42 = !{ i32 1234567 }

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_call
          (type
            (type_keyword))
          (inline_asm
            (asm
              (string))
            (string))
          (argument_list
            (argument
              (type
                (type_keyword))
              (value
                (var
                  (local_var)))))))
      (instruction
        (instruction_call
          (type
            (type_keyword))
          (inline_asm
            (asm
              (string))
            (string))
          (argument_list)))
      (instruction
        (instruction_call
          (type
            (type_keyword))
          (inline_asm
            (asm
              (string))
            (string))
          (argument_list)))
      (instruction
        (instruction_call
          (type
            (type_keyword))
          (inline_asm
            (asm
              (string))
            (string))
          (argument_list)))
      (instruction
        (instruction_call
          (type
            (type_keyword))
          (inline_asm
            (asm
              (string))
            (string))
          (argument_list)))
      (instruction
        (instruction_call
          (type
            (type_keyword))
          (inline_asm
            (asm
              (string))
            (string))
          (argument_list))
        (metadata_refs
          (metadata_name)
          (metadata
            (specialized_md
              (metadata_ref)))))))
  (global_metadata
    (metadata_ref)
    (metadata
      (metadata_tuple
        (metadata
          (type_and_value
            (type
              (type_keyword))
            (value
              (number))))))))

================================================================================
landingpad
================================================================================

define void @main() {
  ;; A landing pad which can catch an integer.
  %res = landingpad { i8*, i32 }
           catch i8** @_ZTIi
  ;; A landing pad that is a cleanup.
  %res = landingpad { i8*, i32 }
           cleanup
  ;; A landing pad which can catch an integer and can only throw a double.
  %res = landingpad { i8*, i32 }
           catch i8** @_ZTIi
           filter [1 x i8**] [i8** @_ZTId]
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (comment)
      (instruction
        (local_var)
        (instruction_landingpad
          (type
            (struct_type
              (struct_body
                (type
                  (type_keyword))
                (type
                  (type_keyword)))))
          (landingpad_clause
            (type_and_value
              (type
                (type_keyword))
              (value
                (var
                  (global_var)))))))
      (comment)
      (instruction
        (local_var)
        (instruction_landingpad
          (type
            (struct_type
              (struct_body
                (type
                  (type_keyword))
                (type
                  (type_keyword)))))))
      (comment)
      (instruction
        (local_var)
        (instruction_landingpad
          (type
            (struct_type
              (struct_body
                (type
                  (type_keyword))
                (type
                  (type_keyword)))))
          (landingpad_clause
            (type_and_value
              (type
                (type_keyword))
              (value
                (var
                  (global_var)))))
          (landingpad_clause
            (type_and_value
              (type
                (array_type
                  (array_vector_body
                    (number)
                    (type
                      (type_keyword)))))
              (value
                (array_value
                  (type_and_value
                    (type
                      (type_keyword))
                    (value
                      (var
                        (global_var)))))))))))))

================================================================================
constant expression
================================================================================

define void @main() {
  %tmp4 = xor i32 %tmp3, zext (i1 icmp ne (i64 ptrtoint (i32* @global5 to i64), i64 1) to i32)
  %tmp5 = icmp eq i32 %tmp3, zext (i1 icmp ne (i64 ptrtoint (i32* @global5 to i64), i64 1) to i32)
  store i32 ptrtoint (i32* @global to i32), i32* getelementptr inbounds (%struct.ham, %struct.ham* @global8, i64 0, i32 0), align 4
  store i32 %tmp10, i32* getelementptr inbounds (%struct.ham, %struct.ham* @global8, i64 0, i32 0), align 4
}

--------------------------------------------------------------------------------

(module
  (define
    (function_header
      (type
        (type_keyword))
      (global_var)
      (argument_list))
    (function_body
      (instruction
        (local_var)
        (instruction_bin_op
          (bin_op_keyword
            (atomic_bin_op_keyword))
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (value
            (constant_expr
              (constant_cast
                (cast_inst)
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (constant_expr
                      (constant_icmp
                        (icmp_cond)
                        (type_and_value
                          (type
                            (type_keyword))
                          (value
                            (constant_expr
                              (constant_cast
                                (cast_inst)
                                (type_and_value
                                  (type
                                    (type_keyword))
                                  (value
                                    (var
                                      (global_var))))
                                (type
                                  (type_keyword))))))
                        (type_and_value
                          (type
                            (type_keyword))
                          (value
                            (number)))))))
                (type
                  (type_keyword)))))))
      (instruction
        (local_var)
        (instruction_icmp
          (icmp_cond)
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (value
            (constant_expr
              (constant_cast
                (cast_inst)
                (type_and_value
                  (type
                    (type_keyword))
                  (value
                    (constant_expr
                      (constant_icmp
                        (icmp_cond)
                        (type_and_value
                          (type
                            (type_keyword))
                          (value
                            (constant_expr
                              (constant_cast
                                (cast_inst)
                                (type_and_value
                                  (type
                                    (type_keyword))
                                  (value
                                    (var
                                      (global_var))))
                                (type
                                  (type_keyword))))))
                        (type_and_value
                          (type
                            (type_keyword))
                          (value
                            (number)))))))
                (type
                  (type_keyword)))))))
      (instruction
        (instruction_store
          (type_and_value
            (type
              (type_keyword))
            (value
              (constant_expr
                (constant_cast
                  (cast_inst)
                  (type_and_value
                    (type
                      (type_keyword))
                    (value
                      (var
                        (global_var))))
                  (type
                    (type_keyword))))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (constant_expr
                (constant_getelementptr
                  (type_and_value
                    (type
                      (local_var)))
                  (type_and_value
                    (type
                      (local_var))
                    (value
                      (var
                        (global_var))))
                  (type_and_value
                    (type
                      (type_keyword))
                    (value
                      (number)))
                  (type_and_value
                    (type
                      (type_keyword))
                    (value
                      (number)))))))
          (number)))
      (instruction
        (instruction_store
          (type_and_value
            (type
              (type_keyword))
            (value
              (var
                (local_var))))
          (type_and_value
            (type
              (type_keyword))
            (value
              (constant_expr
                (constant_getelementptr
                  (type_and_value
                    (type
                      (local_var)))
                  (type_and_value
                    (type
                      (local_var))
                    (value
                      (var
                        (global_var))))
                  (type_and_value
                    (type
                      (type_keyword))
                    (value
                      (number)))
                  (type_and_value
                    (type
                      (type_keyword))
                    (value
                      (number)))))))
          (number))))))
